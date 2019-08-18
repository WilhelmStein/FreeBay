import React, { Component } from 'react';
import { Carousel, CarouselSlide } from 'material-ui-carousel';
import { SquareAuctionItem } from '../components/SearchResults';
import axios from 'axios';

import '../style/Carousel.scss';


export default class CarouselWrapper extends Component {

    constructor(props)
    {
        super(props);
        this.state = {
            username: ( (this.props.user == null) ? (null) : (this.props.user.Username) ),
            auctions: []
        };
    }

    componentDidMount() {
        axios.post('/api/featured', {
            username: this.state.username
        })
        .then( res => {
            console.log(res.data.data)
            
            this.setState({
                auctions: res.data.data
            });
        });

    }

    render() {

        return (
            <div style={{ paddingLeft: '15%', paddingRight: '15%' }}>
                <h2>Featured Auctions</h2>
                <hr/>
                <Carousel>
                    {this.state.auctions.map((item) => {
                        return  <CarouselSlide key={item.Id}>
                                    <div className = "FeaturedItemWrapper Square Grid">
                                        <SquareAuctionItem item={item}/>
                                    </div>
                                </CarouselSlide>
                    })}
                </Carousel>
            </div>
        )
    }
}