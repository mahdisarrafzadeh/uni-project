import React from "react";
import Carousel from "react-material-ui-carousel";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Grid,
  CardActionArea,
  CardActions,
  Button,
} from "@material-ui/core";
import useStyles from "../utils/styles";
import { productItem as string } from "../utils/string";
import NextLink from "next/link";
import { Rating } from "@material-ui/lab";

const ProductCarousel = ({ products, addToCartHandler }) => {
  const classes = useStyles();
  const chunks = products.reduce((resultArray, item, index) => {
    const chunkIndex = Math.floor(index / 3);
    if (!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = [];
    }
    resultArray[chunkIndex].push(item);
    return resultArray;
  }, []);

  return (
    <>
      <Typography variant="h2">شلوار ها</Typography>

      <Carousel cycleNavigation={false} navButtonsAlwaysVisible>
        {chunks.map((chunk, index) => (
          <Grid
            className={classes.productCarousel}
            container
            spacing={4}
            key={index}
          >
            {chunk.map((product) => (
              <Grid item xs={12} sm={4} key={product.name}>
                <Card style={{ height: 430 }}>
                  <NextLink href={`/product/${product.slug}`} passHref>
                    <CardActionArea>
                      <CardMedia
                        component="img"
                        image={product.image}
                        title={product.name}
                        height={300}
                      ></CardMedia>
                      <CardContent>
                        <Typography>{product.name}</Typography>
                        <Rating value={product.rating} readOnly></Rating>
                      </CardContent>
                    </CardActionArea>
                  </NextLink>
                  <CardActions>
                    <Typography>
                      {product.price}
                      {string.prefixMony}
                    </Typography>
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => addToCartHandler(product)}
                    >
                      {string.addToCart}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        ))}
      </Carousel>
    </>
  );
};

export default ProductCarousel;
