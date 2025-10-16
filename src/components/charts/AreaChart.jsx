import { AreaChart as RechartsAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AreaChart = ({ data, areas, xDataKey = 'name', height = 300 }) => {
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <defs>
          {areas.map((area, index) => (
            <linearGradient key={area.dataKey} id={`color${area.dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={area.color || colors[index % colors.length]} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={area.color || colors[index % colors.length]} stopOpacity={0.1}/>
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey={xDataKey}
          stroke="#666"
          tick={{ fill: '#666', fontSize: 12 }}
        />
        <YAxis
          stroke="#666"
          tick={{ fill: '#666', fontSize: 12 }}
        />
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
          iconType="circle"
        />
        {areas.map((area, index) => (
          <Area
            key={area.dataKey}
            type="monotone"
            dataKey={area.dataKey}
            stroke={area.color || colors[index % colors.length]}
            fillOpacity={1}
            fill={`url(#color${area.dataKey})`}
            name={area.name}
            strokeWidth={2}
          />
        ))}
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
};

export default AreaChart;
