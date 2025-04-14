import React from 'react';

class SingleLetterSearchbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inputValue: '',
    };
  }

    handleInputChange = (event) => {
        const value = event.target.value.charAt(0); // Get only the first character
        this.setState({
            inputValue: value}
        );
    };

    handleSearchClick = () => {
        if (this.state.inputValue.length === 1) {
            this.props.onSearch(this.state.inputValue);
        } else {
            alert('Please enter a single letter.');
        }
        // Clear input after search
        this.setState({
            inputValue: ''
        });
    };
    
    render() {
      return (
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
          <input
            type="text"
            value={this.state.inputValue}
            onChange={this.handleInputChange}
            maxLength={1}
            placeholder="Letter"
            style={{
              width: '50px',
              padding: '10px',
              fontSize: '18px',
              textAlign: 'center',
              borderRadius: '8px',
              border: '2px solid #ccc',
              outline: 'none',
            }}
          />
          <button
            onClick={this.handleSearchClick}
            style={{
              padding: '10px 16px',
              fontSize: '16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#007bff',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            Search
          </button>
        </div>
      );
    }
    
}

export default SingleLetterSearchbar;