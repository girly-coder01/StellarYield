import { createApp } from "./app";
import { startIndexer } from "./indexer/indexer";
import { startHistoricalYieldAggregationJob } from "./jobs/historicalYieldAggregation";

const app = createApp();
const PORT = process.env.PORT || 3001;
startIndexer().catch(console.error);
startHistoricalYieldAggregationJob();

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
