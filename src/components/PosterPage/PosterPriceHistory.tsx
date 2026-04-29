import layout from './PosterPriceHistory.module.css';

const mockPriceHistory = [
  { date: '2023-01-15', price: 40000 },
  { date: '2023-05-10', price: 44000 },
  { date: '2023-11-20', price: 700000 },
  { date: '2024-02-01', price: 44000 },
  { date: '2024-04-10', price: 47000 },
];

export function PosterPriceHistory() {
  const data = mockPriceHistory;

  if (!data || data.length <= 1) {
    return null;
  }

  // Use ordinal (rank-based) scaling for prices to handle extreme outliers
  const sortedUniquePrices = Array.from(new Set(data.map(d => d.price))).sort((a, b) => a - b);
  const minDate = new Date(data[0].date).getTime();
  const maxDate = Math.max(Date.now(), new Date(data[data.length - 1].date).getTime());

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
    if (sortedUniquePrices.length <= 1) return paddingY + chartHeight / 2;
    const index = sortedUniquePrices.indexOf(price);
    return paddingY + (index / (sortedUniquePrices.length - 1)) * chartHeight;
  };

  return (
      <div className={layout.container}>
        <h3 className={layout.title}>История изменения цены</h3>
        <div className={layout.chartWrapper}>
          <div style={{ position: 'relative', margin: '0 45px', height: `${height}px`, minWidth: '400px' }}>

            {/* Axis line */}
            <div style={{ position: 'absolute', bottom: paddingY, left: 0, right: 0, height: '1px', background: '#ccc' }} />

            {/* Paths as divs */}
            {data.map((point, index) => {
              if (index === 0) return null;
              const prev = data[index - 1];
              const x1 = getPercentX(prev.date);
              const x2 = getPercentX(point.date);
              const y1 = getYPx(prev.price);
              const y2 = getYPx(point.price);

              return (
                  <div key={`line-${index}`}>
                    <div style={{ position: 'absolute', left: `${x1}%`, width: `${x2 - x1}%`, bottom: `${y1}px`, height: '2px', background: 'var(--accent)' }} />
                    <div style={{ position: 'absolute', left: `${x2}%`, bottom: `${Math.min(y1, y2)}px`, height: `${Math.abs(y1 - y2) + 2}px`, borderLeft: '2px dashed var(--accent)' }} />
                  </div>
              );
            })}

            {/* Final line to the end */}
            {data.length > 0 && (
                <div style={{ position: 'absolute', left: `${getPercentX(data[data.length - 1].date)}%`, right: 0, bottom: `${getYPx(data[data.length - 1].price)}px`, height: '2px', background: 'var(--accent)' }} />
            )}

            {/* Start and End labels */}
            <div className={layout.dateLabel} style={{ left: '100%' }}>
              Сегодня
            </div>
            {data.length > 0 && (
                <div className={layout.dateLabel} style={{ left: '0%' }}>
                  Публикация
                </div>
            )}

            {/* Dots and Tooltips */}
            {data.map((point, index) => {
              const x = getPercentX(point.date);
              const y = getYPx(point.price);
              return (
                  <div key={`point-${index}`} className={layout.pointWrap} style={{ left: `${x}%`, bottom: `${y}px` }}>
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

            {/* Today Point */}
            {data.length > 0 && (
                <div className={layout.pointWrap} style={{ left: '100%', bottom: `${getYPx(data[data.length - 1].price)}px` }}>
                  <div className={layout.point} />
                  <div className={layout.tooltip}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                      {data[data.length - 1].price.toLocaleString()} ₽
                    </div>
                    <div style={{ color: '#ccc', fontSize: '10px' }}>
                      {todayStr}
                    </div>
                  </div>
                </div>
            )}
          </div>
        </div>
      </div>
  );
}
