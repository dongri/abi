import { ethers } from 'ethers';
import React, { useState } from 'react';
import './App.css';

function App() {
  const [inputABI, setInputABI] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [inputValues, setInputValues] = useState({});
  const [functions, setFunctions] = useState([]);
  const [results, setResults] = useState({});
  const [errors, setErrors] = useState({});

  const handleInputABIChange = (e) => {
    try {
      setInputABI(e.target.value);
      const inputABI = JSON.parse(e.target.value);
      setFunctions(inputABI.filter(item => item.type === 'function'));
    } catch (error) {
      console.error(error);
    }
  }
  const handleContractAddressChange = (e) => {
    setContractAddress(e.target.value);
  }

  const handleInputChange = (funcName, inputName, value) => {
    setInputValues(prevValues => ({
      ...prevValues,
      [funcName]: {
        ...prevValues[funcName],
        [inputName]: value
      }
    }));
  };

  const handleExecute = async (func, event) => {
    event.preventDefault();

    console.log(func.name);
    console.log(inputValues[func.name]);
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    console.log(signer);
    const contract = new ethers.Contract(contractAddress, inputABI, signer);

    const funcInputs = inputValues[func.name] || {};

    try {
      let result;
      if (func.inputs.length === 0) {
        result = await contract[func.name]();
        console.log(`Result: ${result}`);
      } else {
        result = await contract[func.name](...Object.values(funcInputs));
        console.log(`Transaction Hash: ${result.hash}`);
      }
      setResults({
        [func.name]: JSON.stringify(result)
      });
    } catch (error) {
      setErrors({
        [func.name]: error.message
      });
    }
  };

  return (
    <div className="App">
      <h1>ABI</h1>
      <p>Execute a smart contract from ABI</p>
      <div className="container">
        <div className="abi-input">
          <input
            id="contractAddress"
            type="text"
            name="contractAddress"
            placeholder="input contract address"
            value={contractAddress}
            onChange={handleContractAddressChange}
          />
          <textarea
            id="abiTextarea" rows="20" 
            placeholder="input contract abi"
            value={inputABI}
            onChange={handleInputABIChange}
          >
          </textarea>
        </div>
        <div className="function-forms" id="functionForms">
          {functions.map(func => (
            <div
              key={func.name}
              className="functionContainer"
            >
              <div className="functionName">{func.name}</div>
              <form onSubmit={(e) => handleExecute(func, e)}>
              {func.inputs.map(input => (
                  <div 
                    key={input.name}
                  >
                    <label>
                      {input.name} ({input.type})
                    </label>
                    <input
                      type="text"
                      className="functionInput"
                      name={input.name}
                      value={inputValues[func.name]?.[input.name] || ''}
                      onChange={(e) => handleInputChange(func.name, input.name, e.target.value)}
                    />
                  </div>
                ))}
                <button type="submit" className="executeButton">Execute</button>
              </form>
              {results[func.name] && <div className="result">{results[func.name]}</div>}
              {errors[func.name] && <div className="error">{errors[func.name]}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
