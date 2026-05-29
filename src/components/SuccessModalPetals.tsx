const SYMBOLS = [
  'sym-sparkle',
  'sym-burst',
  'sym-dot',
  'sym-star-2',
];

export default function SuccessModalPetals() {
  return (
    <div className="petal-container">
      {Array.from({ length: 60 }).map((_, index) => {
        const symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        return <div key={index} className={symbol} />;
      })}
    </div>
  );
}
