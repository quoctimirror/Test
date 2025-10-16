import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const BarChart = ({ data, bars, xDataKey = 'name', height = 300, layout = 'vertical' }) => {
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={data}
        layout={layout}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        {layout === 'vertical' ? (
          <>
            <XAxis type="number" stroke="#666" tick={{ fill: '#666', fontSize: 12 }} />
            <YAxis type="category" dataKey={xDataKey} stroke="#666" tick={{ fill: '#666', fontSize: 12 }} />
          </>
        ) : (
          <>
            <XAxis dataKey={xDataKey} stroke="#666" tick={{ fill: '#666', fontSize: 12 }} />
            <YAxis stroke="#666" tick={{ fill: '#666', fontSize: 12 }} />
          </>
        )}
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.96)',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: '14px' }}
          iconType="square"
        />
        {bars.map((bar, index) => (
          <Bar
            key={bar.dataKey}
            dataKey={bar.dataKey}
            fill={bar.color || colors[index % colors.length]}
            name={bar.name}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

export default BarChart;
