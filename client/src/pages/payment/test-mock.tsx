import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function TestMockPayment() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  
  // Get URL parameters
  const searchParams = new URLSearchParams(window.location.search);
  const appointmentId = searchParams.get("appointmentId");
  const token = searchParams.get("token");
  const businessId = searchParams.get("businessId");
  
  // Test query
  const { data, isLoading, error } = useQuery({
    queryKey: ['test-appointment', appointmentId],
    queryFn: async () => {
      console.log('=== QUERY FUNCTION CALLED ===');
      console.log('appointmentId:', appointmentId);
      
      if (!appointmentId) {
        console.log('No appointmentId, returning null');
        return null;
      }
      
      try {
        console.log('Making API request to:', `/api/appointments/${appointmentId}`);
        const response = await apiRequest("GET", `/api/appointments/${appointmentId}`);
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (!response.ok) {
          console.error('Response not ok, throwing error');
          throw new Error("Failed to fetch appointment");
        }
        
        const appt = await response.json();
        console.log('Raw appointment data:', appt);
        return appt;
      } catch (error) {
        console.error('Query function error:', error);
        throw error;
      }
    },
    enabled: !!appointmentId
  });
  
  useEffect(() => {
    setDebugInfo({
      appointmentId,
      token,
      businessId,
      queryData: data,
      queryLoading: isLoading,
      queryError: error?.message
    });
  }, [appointmentId, token, businessId, data, isLoading, error]);
  
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Test Mock Payment Debug</h1>
      <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
      
      <h2>Query State:</h2>
      <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
      <p>Error: {error ? error.message : 'None'}</p>
      <p>Data: {data ? JSON.stringify(data, null, 2) : 'None'}</p>
    </div>
  );
}
