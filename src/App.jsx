

import { useEffect } from 'react';

import Header from './components/Header';
import Body from './components/Body';


const App = () => {
  useEffect(() => {
      console.log(`yerr`)
  }, []);
  return (
    <>
    <Header />
    <Body />
    </>
  );
}

export default App