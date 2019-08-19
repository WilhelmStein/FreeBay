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
            auctions: []
        };
    }

    componentDidMount() {
        axios.get('/api/featured')
        .then( res => {
            console.log(res.data.data)
            
            this.setState({
                auctions: res.data.data
            });
        });

    }

    render() {

        return (
            <div style={{ paddingLeft: '10%', paddingRight: '10%' }}>
                <h2>Featured Auctions</h2>
                <hr/>
                <Carousel>
                    {this.state.auctions.map((item) => {
                        return  <CarouselSlide key={item.Id}>
                                    <div className = "FeaturedItemWrapper Square">
                                        <SquareAuctionItem item={item}/>
                                    </div>
                                </CarouselSlide>
                    })}
                </Carousel>
            </div>
        )
    }
}