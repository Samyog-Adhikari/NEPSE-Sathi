import StockDetailClient from "./StockDetailClient";

export default async function StockDetailPage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = await params;
  return <StockDetailClient symbol={symbol} />;
}
