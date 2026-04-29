import { useEffect, useState } from 'the-react';
import layout from './PosterPriceHistory.module.css';
import { getPosterPriceHistory } from '../../services/posters';

interface PosterPriceHistoryProps {
  alias: string;
}

interface PricePoint {
  date: string;
  price: number;
}

export function PosterPriceHistory({ alias }: PosterPriceHistoryProps) {
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [sortedUniquePrices, setSortedUniquePrices] = useState<number[]>([]);
  const [minDate, setMinDate] = useState(0);
  const [maxDate, setMaxDate] = useState(0);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      const history = await getPosterPriceHistory(alias);
      const safeHistory = history || [];

      // 👉 сортируем сразу (ВАЖНО)
      const sortedHistory = [...safeHistory].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      setPriceHistory(sortedHistory);

      if (sortedHistory.length) {
        const prices = Array.from(
          new Set(sortedHistory.map(d => d.price))
        ).sort((a, b) => a - b);

        setSortedUniquePrices(prices);

        const min = new Date(sortedHistory[0].date).getTime();
        const max = Math.max(
          Date.now(),
          new Date(sortedHistory[sortedHistory.length - 1].date).getTime()
        );

        setMinDate(min);
        setMaxDate(max);
      } else {
        setSortedUniquePrices([]);
        setMinDate(0);
        setMaxDate(0);
      }

    } catch {
      setPriceHistory([]);
      setSortedUniquePrices([]);
      setMinDate(0);
      setMaxDate(0);
    } finally {
      setIsLoading(false);
    }
  };



  useEffect(() => {
    fetchData();
  }, [alias]);

  const isComputedReady =
  sortedUniquePrices.length > 0 &&
  minDate !== 0 &&
  maxDate !== 0;

  const height = 240;
  const paddingY = 40;
  const topPadding = 70;
  const chartHeight = height - paddingY - topPadding;

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const getPercentX = (dateStr: string) => {
    const time = new Date(dateStr).getTime();
    if (maxDate === minDate) return 0;
    return ((time - minDate) / (maxDate - minDate)) * 100;
  };

  const getYPx = (price: number) => {
    if (sortedUniquePrices.length <= 1) {
      return paddingY + chartHeight / 2;
    }
    const index = sortedUniquePrices.indexOf(price);
    return paddingY + (index / (sortedUniquePrices.length - 1)) * chartHeight;
  };

  return (
    <div style={!isLoading && priceHistory.length === 0 && { display: 'none' }}>
    <div className={layout.container}>
      <h3 className={layout.title}>История изменения цены</h3>

      {isLoading || !isComputedReady ? (
        <div>Загрузка...</div>
      ) : (
        <div className={layout.chartWrapper}>
          <div
            style={{
              position: 'relative',
              margin: '0 45px',
              height: `${height}px`,
              minWidth: '400px',
            }}
          >
            {/* Axis */}
            <div
              style={{
                position: 'absolute',
                bottom: paddingY,
                left: 0,
                right: 0,
                height: '1px',
                background: '#ccc',
              }}
            />

            {/* Lines */}
            {priceHistory.map((point, index) => {
              if (index === 0) return null;

              const prev = priceHistory[index - 1];

              const x1 = getPercentX(prev.date);
              const x2 = getPercentX(point.date);

              const y1 = getYPx(prev.price);
              const y2 = getYPx(point.price);

              return (
                <div key={`line-${index}`}>
                  {/* horizontal */}
                  <div
                    style={{
                      position: 'absolute',
                      left: `${x1}%`,
                      width: `${x2 - x1}%`,
                      bottom: `${y1}px`,
                      height: '2px',
                      background: 'var(--accent)',
                    }}
                  />

                  {/* vertical */}
                  <div
                    style={{
                      position: 'absolute',
                      left: `${x2}%`,
                      bottom: `${Math.min(y1, y2)}px`,
                      height: `${Math.abs(y1 - y2) + 2}px`,
                      borderLeft: '2px dashed var(--accent)',
                    }}
                  />
                </div>
              );
            })}

            {/* Tail line */}
            {priceHistory.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  left: `${getPercentX(
                    priceHistory[priceHistory.length - 1].date
                  )}%`,
                  right: 0,
                  bottom: `${getYPx(
                    priceHistory[priceHistory.length - 1].price
                  )}px`,
                  height: '2px',
                  background: 'var(--accent)',
                }}
              />
            )}

            {/* Labels */}
            <div className={layout.dateLabel} style={{ left: '100%' }}>
              Сегодня
            </div>

            {priceHistory.length > 0 && (
              <div className={layout.dateLabel} style={{ left: '0%' }}>
                Публикация
              </div>
            )}

            {/* Points */}
            {priceHistory.map((point, index) => {
              const x = getPercentX(point.date);
              const y = getYPx(point.price);

              return (
                <div
                  key={`point-${index}`}
                  className={layout.pointWrap}
                  style={{ left: `${x}%`, bottom: `${y}px` }}
                >
                  <div className={layout.point} />

                  <div className={layout.tooltip}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                      {point.price.toLocaleString()} ₽
                    </div>
                    <div style={{ color: '#ccc', fontSize: '10px' }}>
                      {point.date}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Today point */}
            {priceHistory.length > 0 && (
              <div
                className={layout.pointWrap}
                style={{
                  left: '100%',
                  bottom: `${getYPx(
                    priceHistory[priceHistory.length - 1].price
                  )}px`,
                }}
              >
                <div className={layout.point} />

                <div className={layout.tooltip}>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                    {priceHistory[
                      priceHistory.length - 1
                    ].price.toLocaleString()}{' '}
                    ₽
                  </div>
                  <div style={{ color: '#ccc', fontSize: '10px' }}>
                    {todayStr}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div></div>
  );
}
