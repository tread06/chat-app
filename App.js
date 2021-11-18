import React from 'react';
import { LogBox } from 'react-native';
import ChatApp from './components/chat-app';

export default function App() {
  LogBox.ignoreAllLogs();
  return <ChatApp />;
}
