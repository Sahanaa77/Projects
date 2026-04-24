/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import DrawingBoard from './components/DrawingBoard';

export default function App() {
  return (
    <div className="w-full h-screen bg-black overflow-hidden font-sans">
      <DrawingBoard />
    </div>
  );
}

