import React, { useEffect, useState } from "react";
import { roleMatrixAPI } from "@/services/api";
import { SkeletonTable } from "./Skeleton";

const RBACMatrix = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await roleMatrixAPI.getMatrix();
        setRows(data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load role matrix");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="admin-card admin-p-lg">
        <div className="skeleton" style={{ width: '250px', height: '1.5rem', marginBottom: '1rem' }} />
        <SkeletonTable rows={8} columns={4} />
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Role-Based Access Matrix</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2 text-left">Role</th>
              <th className="border px-3 py-2 text-left">Purpose</th>
              <th className="border px-3 py-2 text-left">UI Tabs</th>
              <th className="border px-3 py-2 text-left">Key Actions</th>
              <th className="border px-3 py-2 text-left">Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="border px-3 py-2 font-semibold">{row.roleName}</td>
                <td className="border px-3 py-2">{row.purpose}</td>
                <td className="border px-3 py-2 whitespace-pre-line">{row.uiTabs}</td>
                <td className="border px-3 py-2 whitespace-pre-line">{row.keyActions}</td>
                <td className="border px-3 py-2">{row.lastUpdated}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="border px-3 py-2" colSpan={5}>
                  No entries found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RBACMatrix;
