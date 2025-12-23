import React, { useState } from 'react';
import Layout from './components/Layout';
import InputSection from './components/InputSection';
import SolutionSteps from './components/SolutionSteps';
import TheoryPage from './components/pages/TheoryPage';
import AboutPage from './components/pages/AboutPage';
import { calculateIntegral } from './utils/numericalIntegration';
import { solveIndefiniteIntegral } from './utils/symbolicIntegration';
import './styles/components.css';

function App() {
  const [activePage, setActivePage] = useState('calculator');
  const [result, setResult] = useState(null);

  const handleCalculate = (data) => {
    try {
      const hasLimits = (data.lowerLimit !== '' && data.upperLimit !== '') || (data.lowerLimit !== undefined && data.upperLimit !== undefined && data.lowerLimit !== '' && data.upperLimit !== '');
      let calcResult;

      if (hasLimits) {
        calcResult = calculateIntegral(data.func, data.lowerLimit, data.upperLimit, data.nValue, data.method);
      } else {
        calcResult = solveIndefiniteIntegral(data.func);
      }

      setResult(calcResult);
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const renderContent = () => {
    switch (activePage) {
      case 'theory':
        return <TheoryPage />;
      case 'about':
        return <AboutPage />;
      case 'calculator':
      default:
        return (
          <>
            <InputSection onCalculate={handleCalculate} />
            {result && <SolutionSteps result={result} />}
          </>
        );
    }
  };

  return (
    <Layout activePage={activePage} setActivePage={setActivePage}>
      {renderContent()}
    </Layout>
  );
}

export default App;
