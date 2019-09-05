import React from 'react';

import { Grid, Card, CardHeader, CardContent, Typography, CardMedia } from '@material-ui/core';

import '../style/About.scss';
import TransportImage from '../images/airplane.png';

export default function About() {

    let data = [
        {
            header: 'About Freebay', 
            text: `Launched in 2019, FreeBay is the leading platform for global wholesale trade.
                   We serve millions of buyers and suppliers around the world.`,
            image: TransportImage
        },
        {
            header: 'Our Mission', 
            text: `Is to make it easy to do business anywhere.
                   We do this by giving suppliers the tools necessary to reach a global audience for their products,
                   and by helping buyers find products and suppliers quickly and efficiently.`,
            image: 'https://bit.ly/2m0GOXI'
        },
        {
            header: 'One-Stop Sourcing', 
            text: `Freebay brings you hundreds of millions of products in over 40 different major categories, including consumer
                   electronics, machinery and apparel. Buyers for these products are located in 190+ countries and regions,
                   and exchange hundreds of thousands of messages with suppliers on the platform each day.`,
            image: 'https://bit.ly/2m0GOXI'
        }
    ];

    let content = data.map((item, index) => {

        if(index % 2 == 0)
        {
            return <Card className={`AboutCard Even`}>
                        <CardHeader title={<Typography className="Title">{item.header}</Typography>}/>

                        <Grid container>
                            <Grid item>
                                <CardContent className="Text">
                                    {item.text}
                                </CardContent>
                            </Grid>
                            
                            <Grid item>
                                <CardMedia className="Media" image={item.image}/>
                            </Grid>
                        </Grid>
                    </Card>
        }
        else
        {
            return <Card className={`AboutCard Odd`}>
                        <CardHeader title={<Typography className="Title">{item.header}</Typography>}/>

                        <Grid container>

                            <Grid item>
                                <CardMedia className="Media" image={item.image}/>
                            </Grid>

                            <Grid item>
                                <CardContent className="Text">
                                    {item.text}
                                </CardContent>
                            </Grid>
                        </Grid>
                    </Card>
        }

    }) 

    return(
        content
    );
}