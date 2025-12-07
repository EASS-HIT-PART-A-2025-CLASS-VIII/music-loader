from types import SimpleNamespace
from urllib.parse import urljoin

from src.scrapping import mutopia
from src.schemas.models import MusicalPiece
from tests.conftest import FakePieceDAO, make_soup


class FakeResponse:
    def __init__(self, text: str):
        self.text = text

    def raise_for_status(self):
        return None


def test_get_piece_pages_deduplicates(monkeypatch):
    html = '<a href="cgibin/piece-info.cgi?id=1">1</a><a href="cgibin/piece-info.cgi?id=1">1</a>'
    monkeypatch.setattr(
        mutopia.session, "get", lambda url, timeout=20: FakeResponse(html)
    )

    urls = mutopia.get_piece_pages()
    assert urls == [urljoin(mutopia.BASE_URL, "cgibin/piece-info.cgi?id=1")]


def test_fetch_piece_page_returns_soup(monkeypatch):
    html = "<html><body><h2>Title</h2></body></html>"
    monkeypatch.setattr(mutopia.session, "get", lambda url, timeout=20: FakeResponse(html))
    soup = mutopia.fetch_piece_page("http://example.com")
    assert soup.find("h2").text == "Title"


def test_find_pdf_link(monkeypatch):
    soup = make_soup('<a href="/score.pdf">A4 PDF</a>')
    url = mutopia.find_pdf_link("http://example.com/piece", soup=soup)
    assert url == "http://example.com/score.pdf"


def test_extract_piece_metadata(monkeypatch):
    html = """
    <html>
        <h2>My Piece</h2>
        <h4>by Jane Doe</h4>
        <table class="result-table">
            <tr><td><b>Instrument(s):</b> Piano</td></tr>
            <tr><td><b>Style:</b> Romantic</td></tr>
            <tr><td><b>Opus:</b> Op.1</td></tr>
            <tr><td><b>Date of composition:</b> 2024</td></tr>
            <tr><td><b>Source:</b> Public</td></tr>
            <tr><td><b>Copyright:</b> None</td></tr>
            <tr><td><b>Last updated:</b> Today</td></tr>
            <tr><td><b>Music ID Number:</b> 123</td></tr>
        </table>
        <a href="/piece.pdf">A4 PDF</a>
    </html>
    """
    soup = make_soup(html)
    piece = mutopia.extract_piece_metadata("http://example.com/page", soup=soup)
    assert piece.title == "My Piece"
    assert piece.composer == "Jane Doe"
    assert piece.instruments == "Piano"
    assert piece.pdf_url.endswith("piece.pdf")


def test_start_scrapping_inserts_and_honors_limit(monkeypatch):
    fake_piece_dao = FakePieceDAO()
    monkeypatch.setattr(mutopia, "piece_dao", fake_piece_dao)
    monkeypatch.setattr(mutopia, "time", SimpleNamespace(sleep=lambda _delay: None))

    page_urls = ["http://example.com/1", "http://example.com/2"]
    monkeypatch.setattr(mutopia, "get_piece_pages", lambda: page_urls)

    soups = [
        make_soup("<h2>First</h2><h4>by A</h4><table class='result-table'><tr><td><b>Instrument(s):</b> Piano</td></tr></table><a href='/a.pdf'>A4 PDF</a>"),
        make_soup("<h2>Second</h2><h4>by B</h4><table class='result-table'><tr><td><b>Instrument(s):</b> Violin</td></tr></table><a href='/b.pdf'>A4 PDF</a>"),
    ]

    def fake_fetch(url):
        return soups.pop(0)

    monkeypatch.setattr(mutopia, "fetch_piece_page", fake_fetch)

    def fake_extract(url, soup=None):
        return MusicalPiece.model_validate({"title": f"Title {url[-1]}", "instruments": "Piano"})

    monkeypatch.setattr(mutopia, "extract_piece_metadata", fake_extract)

    mutopia.start_scrapping(max_pieces=1, delay=0)
    assert len(fake_piece_dao.inserted) == 1
    assert fake_piece_dao.inserted[0].title == "Title 1"
