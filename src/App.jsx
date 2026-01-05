import React, { useState } from 'react';
import Layout from './components/Layout';
import InputSection from './components/InputSection';
import SolutionSteps from './components/SolutionSteps';
import TheoryPage from './components/pages/TheoryPage';
import AboutPage from './components/pages/AboutPage';
import ChatbotSidebar from './components/ChatbotSidebar';
import { calculateIntegral } from './utils/numericalIntegration';
import { solveIndefiniteIntegral } from './utils/symbolicIntegration';
import './styles/components.css';

function App() {
  const [activePage, setActivePage] = useState('calculator');
  const [method, setMethod] = useState('trapezoidal');
  const [results, setResults] = useState({});

  const handleCalculate = (data) => {
    try {
      const hasLimits = (data.lowerLimit !== '' && data.upperLimit !== '') || (data.lowerLimit !== undefined && data.upperLimit !== undefined && data.lowerLimit !== '' && data.upperLimit !== '');
      let calcResult;

      if (hasLimits) {
        if (method === 'comparison') {
          // Run all 3 methods
          const trap = calculateIntegral(data.func, data.lowerLimit, data.upperLimit, data.nValue, 'trapezoidal');
          const sim13 = calculateIntegral(data.func, data.lowerLimit, data.upperLimit, data.nValue, 'simpson13');
          const sim38 = calculateIntegral(data.func, data.lowerLimit, data.upperLimit, data.nValue, 'simpson38');

          calcResult = {
            isComparison: true,
            func: data.func,
            results: [trap, sim13, sim38]
          };
        } else {
          calcResult = calculateIntegral(data.func, data.lowerLimit, data.upperLimit, data.nValue, method);
        }
      } else {
        calcResult = solveIndefiniteIntegral(data.func);
      }

      setResults(prev => ({
        ...prev,
        [method]: calcResult
      }));
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const handleMethodChange = (newMethod) => {
    setMethod(newMethod);
    // Do NOT clear results
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
            {results[method] && <SolutionSteps result={results[method]} />}
          </>
        );
    }
  };

  return (
    <>
      <Layout activePage={activePage} setActivePage={setActivePage} method={method} setMethod={handleMethodChange}>
        {renderContent()}
      </Layout>
      <ChatbotSidebar />
    </>
  );
}

export default App;
