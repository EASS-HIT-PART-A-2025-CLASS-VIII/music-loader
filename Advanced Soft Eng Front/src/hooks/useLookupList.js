import { useEffect } from 'react';

export function useLookupList({ activeTab, tabKey, fetcher, setter }) {
  useEffect(() => {
    if (activeTab !== tabKey) return;
    let cancelled = false;

    const load = async () => {
      try {
        const data = await fetcher();
        if (!cancelled && data?.length) {
          setter(data);
        }
      } catch (err) {
        console.error(`Error fetching ${tabKey}:`, err);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [activeTab, tabKey, fetcher, setter]);
}
