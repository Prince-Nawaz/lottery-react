import React, { Component } from 'react';
import lottery from './lottery';
import web3 from './web3';
export class App extends Component {
  state = {
    manager: '',
    players: [],
    player: '',
    balance: '',
    value: '',
    message: '',
  };

  onSubmit = async (event) => {
    event.preventDefault();
    const accounts = await web3.eth.getAccounts();
    this.setState({ message: 'Waiting on transaction success...' });
    try {
      await lottery.methods.enter().send({
        from: accounts[0],
        value: web3.utils.toWei(this.state.value, 'ether'),
      });
      this.setState({ message: 'You have been entered! ' });
      this.updatedContractDetails();
    } catch (error) {
      console.log(error);
      this.setState({ message: error.message });
    }
  };

  onPickWinner = async () => {
    const accounts = await web3.eth.getAccounts();
    this.setState({ message: 'Waiting on transaction success...' });
    try {
      await lottery.methods.pickWinner().send({ from: accounts[0] });
      this.setState({ message: 'A winner has been picked' });
      this.updatedContractDetails();
    } catch (err) {
      console.log(err);
      this.setState({ message: err.message });
    }
  };

  async updatedContractDetails() {
    // const manager = await lottery.methods.manager().call();
    // const players = await lottery.methods.getPlayers().call();
    // const balance = await web3.eth.getBalance(lottery.options.address);
    const [manager, players, balance] = await Promise.all([
      await lottery.methods.manager().call(),
      await lottery.methods.getPlayers().call(),
      await web3.eth.getBalance(lottery.options.address),
    ]);
    const accounts = await web3.eth.getAccounts();
    const player = accounts[0];
    this.setState({
      manager,
      players,
      balance,
      player,
    });
  }

  render() {
    // console.log(web3.version);
    return (
      <div>
        <h2>Lottery Contract</h2>
        <p>This contract is managed by {this.state.manager}.</p>
        <p>
          There are currently {this.state.players.length} entered, competing to
          win {web3.utils.fromWei(this.state.balance, 'ether')} ether!
        </p>

        <hr />
        <form onSubmit={this.onSubmit}>
          <h4>Want to try your luck?</h4>
          <div>
            <label>Amount of ether to enter </label>
            <input
              value={this.state.value}
              onChange={(event) => this.setState({ value: event.target.value })}
            />
          </div>
          <button type='submit'>enter</button>
        </form>

        <hr />
        <h4>Ready to pick a winner?</h4>
        {this.state.player === this.state.manager && (
          <button
            type='button'
            onClick={this.onPickWinner}
            disabled={!this.state.players.length > 0}
          >
            Pick a Winner!
          </button>
        )}

        <hr />
        <h1>{this.state.message}</h1>
      </div>
    );
  }

  componentDidMount() {
    this.updatedContractDetails();
  }
}

export default App;
