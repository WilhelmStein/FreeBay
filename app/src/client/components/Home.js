import React, { Component } from 'react';
import logo from '../images/Logo.png';


export default class Home extends Component
{
    constructor(props)
    {
        super(props);

        this.state = props;
    }

    render()
    {
        return (
            <div className="Home">
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo" />
                </header>
            </div>
        );
    }
}