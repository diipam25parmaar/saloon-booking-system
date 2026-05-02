import { useState, useEffect, useCallback } from 'react';
import api from '../api';

export function useBookingData() {
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [appointments, setAppointments] = useState([]);

  const [rules, setRules] = useState([]);
  const [rulesLoading, setRulesLoading] = useState(false);
  const [ruleMessage, setRuleMessage] = useState("");
  const [ruleError, setRuleError] = useState("");

  const loadServices = useCallback(async () => {
    try {
      const [servicesRes, categoriesRes] = await Promise.all([
        api.get("/services"),
        api.get("/categories")
      ]);
      setServices(servicesRes.data);
      setCategories(categoriesRes.data);
    } catch (e) {
      console.error("Failed to load services or categories:", e);
    }
  }, []);

  const loadRules = useCallback(async () => {
    setRulesLoading(true);
    setRuleError("");
    try {
      const { data } = await api.get("/working-time-rules");
      setRules(data);
    } catch (error) {
      setRuleError(error.response?.data?.message || "Network error. Failed to load rules.");
    } finally {
      setRulesLoading(false);
    }
  }, []);

  const fetchSlotsAndAppointments = useCallback(async (date, service_id) => {
    setSlotsError("");
    setSlots([]);
    setAppointments([]);

    if (!date) return;

    try {
      setSlotsLoading(true);

      const promises = [];
      
      // Admin might not provide service_id. Only fetch slots if service_id exists.
      if (service_id) {
        promises.push(api.get("/available-slots", { params: { date, service_id } }));
      } else {
        promises.push(Promise.resolve({ status: 'skipped' }));
      }
      
      promises.push(api.get("/appointments", { params: { date } }));

      const [slotsResult, apptsResult] = await Promise.allSettled(promises);

      if (slotsResult.status === 'fulfilled') {
        if (slotsResult.value.status !== 'skipped') {
          setSlots(slotsResult.value.data.data);
        } else {
          setSlots([]); // No service_id provided, leave slots empty
        }
      } else {
        throw slotsResult.reason;
      }

      if (apptsResult.status === 'fulfilled') {
        setAppointments(apptsResult.value.data.data || []);
      } else if (apptsResult.reason?.response?.status !== 403) {
        console.error("Failed to fetch appointments:", apptsResult.reason);
      }

    } catch (error) {
      setSlotsError(error.response?.data?.message || "Network error. Failed to load data. Please try again.");
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  return {
    categories,
    services,
    slots,
    slotsLoading,
    slotsError,
    appointments,
    rules,
    rulesLoading,
    ruleMessage,
    setRuleMessage,
    ruleError,
    setRuleError,
    loadRules,
    fetchSlotsAndAppointments
  };
}
