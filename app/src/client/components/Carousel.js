import React, { Component } from 'react'
import { Card, CardContent, CardMedia, Typography } from '@material-ui/core';
import { Carousel, CarouselSlide } from 'material-ui-carousel'
import axios from 'axios';


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

            // Get actual photo here

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
                    {this.state.auctions.map(({ Id, Path, Name }) => (
                        <CarouselSlide key={Id}>
                            <Card>
                                <CardMedia
                                    image={`/api/image/?path=${Path}`}
                                    title={Name}
                                    style={{
                                        height: 256,
                                        width: 256,
                                        resizeMode: 'contain',
                                    }}
                                />
                                <CardContent>
                                    <Typography>{Name}</Typography>
                                </CardContent>
                            </Card>
                        </CarouselSlide>
                    ))}
                </Carousel>
            </div>
        )
    }
}