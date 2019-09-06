import React from 'react';

import { Grid, Card, CardHeader, CardContent, Typography, CardMedia } from '@material-ui/core';

import '../style/About.scss';
import airplane from '../images/airplane.png';
import transport from '../images/transport.png';
import map from '../images/map.png';

export default function About() {

    let data = [
        {
            header: {text: 'About Freebay', style:{backgroundColor: '$lesser-white'}},
            content: {
                text: `Launched in 2019, FreeBay is the leading platform for global wholesale trade.
                    We serve millions of buyers and suppliers around the world.`,
                // style:{width: '50%', float:'left'}
            },
            media: {
                src: airplane,
                // style: {width: '50%', float: 'right'}
            }
        },
        {
            header: {text: 'Our Mission'},
            content: {
                text: `Is to make it easy to do business anywhere.
                    We do this by giving suppliers the tools necessary to reach a global audience for their products,
                    and by helping buyers find products and suppliers quickly and efficiently.`,
                style:{float:'left'}
            },
            media: {
                src: transport,
                style:{width: '400px', height: '330px', marginTop: '50px'}
            }
        },
        {
            header: {text: 'One-Stop Sourcing', style:{backgroundColor: '$lesser-white'}},
            content: {
                text: `Freebay brings you hundreds of millions of products in over 40 different major categories, including consumer
                    electronics, machinery and apparel. Buyers for these products are located in 190+ countries and regions,
                    and exchange hundreds of thousands of messages with suppliers on the platform each day.`
            },
            media: {
                src: map,
                style: {marginTop: '50px'}
            }
        }
    ];

    let content = data.map((item, index) => {
        let type = (index % 2 == 0) ? ('Even') : ('Odd');
        return <div className={`Wrapper ${type}`}>
                    <Grid spacing={0} container className={`AboutCard ${type}`}>
                            {
                                (index % 2 == 0)
                                ?
                                (
                                    <Grid item xs={7} sm={3} style={item.content.style}>
                                        <CardContent className="Text">
                                            <CardHeader title={<Typography className="Title" style={item.header.style}>{item.header.text}</Typography>}/>
                                            {item.content.text}
                                        </CardContent>
                                    </Grid>
                                )
                                :
                                ("")
                            }
                            
                            <Grid item xs={5} sm={3}>
                                <CardMedia className="Media" image={item.media.src} style={item.media.style}/>
                            </Grid>

                            {
                                (index % 2 == 1)
                                ?
                                (
                                    <Grid item xs={7} sm={3} style={item.content.style}>
                                        <CardContent className="Text">
                                            <CardHeader title={<Typography className="Title" style={item.header.style}>{item.header.text}</Typography>}/>
                                            {item.content.text}
                                        </CardContent>
                                    </Grid>
                                )
                                :
                                ("")
                            }
                    </Grid>
                </div>
    }) 

    return(
        content
    );
}