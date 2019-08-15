import React, { Component } from 'react';
import Carousel from './Carousel';

export default class Home extends Component
{
    constructor(props)
    {
        super(props);

        this.state = {
            user: this.props.user
        };
    }

    render()
    {
        return (
            <div className="Home">
                <Carousel user={this.state.user} loginHandler={this.props.loginHandler}/>
            </div>
        );
    }
}