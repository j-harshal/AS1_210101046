import React, { useCallback, useEffect, useState } from 'react';
import Header from './components/Header';
import Grid from './components/Grid';
import { GET_TICKETS_URL } from './constants';
import { loadGrid, mapUsersByUserId } from './utils';
import { Ticket, User } from './interfaces';
import Loader from './components/Loader';
import './App.css';

function App() {
  const [ticketData, setTicketData] = useState<Ticket[]>([]);
  const [userDetails, setUserDetails] = useState<Record<string, User>>({});
  const [organizedGrid, setOrganizedGrid] = useState<Record<string, Ticket[]>>({});
  const [currentGrouping, setCurrentGrouping] = useState<string>("status");
  const [currentOrdering, setCurrentOrdering] = useState<string>("priority");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch the ticket and user data when the component is first rendered
  useEffect(() => {
    loadSavedSettings();
    fetch(GET_TICKETS_URL)
      .then(response => response.json())
      .then(data => {
        const { tickets, users } = data;
        setTicketData(tickets);
        setUserDetails(mapUsersByUserId(users));
      })
      .catch(error => console.error('Failed to fetch data:', error));
  }, []);

  // Update the grid layout based on grouping and ordering
  useEffect(() => {
    if (ticketData.length === 0) return;
    setOrganizedGrid(loadGrid(ticketData, currentGrouping, currentOrdering));
    setIsLoading(false);
  }, [currentGrouping, currentOrdering, ticketData]);

  // Handle changes in the grouping option
  const handleGroupingChange = useCallback((newGrouping: string) => {
    setIsLoading(true);
    setCurrentGrouping(newGrouping);
    saveSettings({ grouping: newGrouping });
  }, []);

  // Handle changes in the ordering option
  const handleOrderingChange = useCallback((newOrdering: string) => {
    setIsLoading(true);
    setCurrentOrdering(newOrdering);
    saveSettings({ ordering: newOrdering });
  }, []);

  // Save settings to local storage
  const saveSettings = useCallback((settings: Record<string, string>) => {
    for (let key in settings) {
      localStorage.setItem(key, settings[key]);
    }
  }, []);

  // Load saved settings from local storage
  const loadSavedSettings = useCallback(() => {
    setCurrentGrouping(localStorage.getItem("grouping") || "status");
    setCurrentOrdering(localStorage.getItem("ordering") || "priority");
  }, []);

  return (
    <div className="App">
      <Header grouping={currentGrouping} setGrouping={handleGroupingChange} ordering={currentOrdering} setOrdering={handleOrderingChange} />
      {isLoading ? <Loader /> :
        <Grid gridData={organizedGrid} grouping={currentGrouping} userIdToData={userDetails} />
      }
    </div>
  );
}

export default App;
