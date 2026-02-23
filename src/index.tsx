import { render } from 'ink';
import React from 'react';
import { App } from './App.js';
import { closeDatabase } from './db/database.js';

const instance = render(<App />);

instance.waitUntilExit().then(() => {
  closeDatabase();
});
