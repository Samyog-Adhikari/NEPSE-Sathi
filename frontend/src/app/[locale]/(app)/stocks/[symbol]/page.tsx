export default async function StockDetailPage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = await params;
  return (
    <div>
      <h1>Stock: {symbol?.toUpperCase()}</h1>
    </div>
  );
}
