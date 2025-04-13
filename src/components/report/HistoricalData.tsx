import React from 'react';
import { Table, Table2, Tablet, Sheet, TableProperties, Grid } from 'lucide-react';

interface HistoricalDataProps {
  classificationResults: Array<{ id: number; status: string; confidence: string; timestamp: string }>;
}

export const HistoricalData: React.FC<HistoricalDataProps> = ({ classificationResults }) => {
  return (
    <Grid>
      <Table>
        <Sheet>
          <TableProperties>
            <Tablet>Date & Time</Tablet>
            <Tablet>Classification</Tablet>
            <Tablet>Confidence</Tablet>
            <Tablet>Actions</Tablet>
          </TableProperties>
        </Sheet>
        <Table2>
          {classificationResults.map((result) => (
            <TableProperties key={result.timestamp}>
              <Tablet>{result.timestamp}</Tablet>
              <Tablet>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  result.status === 'Normal' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {result.status}
                </span>
              </Tablet>
              <Tablet>{result.confidence}</Tablet>
              <Tablet>
                <button className="text-blue-600 hover:text-blue-900">Select</button>
              </Tablet>
            </TableProperties>
          ))}
        </Table2>
      </Table>
    </Grid>
  );
};