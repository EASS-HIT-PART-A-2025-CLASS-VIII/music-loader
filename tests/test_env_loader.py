import importlib.util
import os
import sys
import types

from src import env_loader


def test_load_env_file_manual_path(monkeypatch, tmp_path):
    env_file = tmp_path / ".env"
    env_file.write_text(
        "\n".join(
            [
                "# comment",
                "FOO=bar",
                "QUOTED='baz'",
                "WITH_COMMENT=value # trailing",
            ]
        )
    )
    monkeypatch.setenv("FOO", "existing")
    monkeypatch.setattr(importlib.util, "find_spec", lambda name: None)

    env_loader.load_env_file(env_file)

    assert os.environ["FOO"] == "existing"  # keep existing values
    assert os.environ["QUOTED"] == "baz"
    assert os.environ["WITH_COMMENT"] == "value"


def test_load_env_file_no_file_silently_passes(monkeypatch, tmp_path):
    env_path = tmp_path / "missing.env"
    monkeypatch.setattr(importlib.util, "find_spec", lambda name: None)
    env_loader.load_env_file(env_path)  # should not raise


def test_load_env_file_uses_dotenv_when_available(monkeypatch, tmp_path):
    env_file = tmp_path / ".env"
    env_file.write_text("FOO=bar")

    called = {}

    def fake_find_spec(name: str):
        return object()

    fake_dotenv = types.SimpleNamespace(
        load_dotenv=lambda path, override=False: called.setdefault(
            "args", (path, override)
        )
    )

    monkeypatch.setattr(importlib.util, "find_spec", fake_find_spec)
    monkeypatch.setitem(sys.modules, "dotenv", fake_dotenv)

    env_loader.load_env_file(env_file)
    assert called["args"] == (env_file, False)
