import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import fs from 'fs'
import path from 'path'

function savePoisPlugin() {
  return {
    name: 'save-pois-plugin',
    configureServer(server) {
      server.ws.on('custom:save-pois', (data, client) => {
        const filePath = path.resolve(__dirname, 'src/components/campus/campusData.js');
        let content = fs.readFileSync(filePath, 'utf-8');
        const regex = /export const BUILDING_POIS = \[[\s\S]*?\];/;
        const newPois = `export const BUILDING_POIS = ${JSON.stringify(data, null, 2)};`;
        if (regex.test(content)) {
          content = content.replace(regex, newPois);
          fs.writeFileSync(filePath, content, 'utf-8');
          console.log('✅ Successfully saved custom POIs to campusData.js');
        } else {
          // If the array doesn't exist yet, append it
          fs.appendFileSync(filePath, `\n\n${newPois}\n`, 'utf-8');
        }
      });
    }
  };
}

function saveWallsPlugin() {
  return {
    name: 'save-walls-plugin',
    configureServer(server) {
      server.ws.on('custom:save-walls', (data, client) => {
        const filePath = path.resolve(__dirname, 'src/components/campus/campusData.js');
        let content = fs.readFileSync(filePath, 'utf-8');
        const regex = /export const COLLISION_BOXES = \[[\s\S]*?\];/;
        const newBoxes = `export const COLLISION_BOXES = ${JSON.stringify(data, null, 2)};`;
        if (regex.test(content)) {
          content = content.replace(regex, newBoxes);
          fs.writeFileSync(filePath, content, 'utf-8');
          console.log('✅ Successfully saved custom walls to campusData.js');
        }
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), savePoisPlugin(), saveWallsPlugin()],
})
