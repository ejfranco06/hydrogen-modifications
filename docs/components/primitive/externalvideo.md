---
gid: 1e35ff3e-fafe-11eb-9a03-0242ac130003
title: ExternalVideo
description: The ExternalVideo component renders an embedded video for the Storefront API's ExternalVideo object.
---

The `ExternalVideo` component renders an embedded video for the Storefront
API's [ExternalVideo object](https://shopify.dev/api/storefront/reference/products/externalvideo).

## Example code

```tsx
import {ExternalVideo, gql} from '@shopify/hydrogen';

const QUERY = gql`
  query Products {
    products(first: 5) {
      edges {
        node {
          id
          title
          handle
          media(first: 1) {
            edges {
              node {
                ... on ExternalVideo {
                  mediaContentType
                  id
                  embedUrl
                  host
                }
              }
            }
          }
        }
      }
    }
  }
`;

export default function MyProductVideo() {
  const {data} = useShopQuery({query: QUERY});

  const firstMediaElement = data.products.edges[0].node.media.edges[0].node;
  if (firstMediaElement.mediaContentType === 'EXTERNAL_VIDEO') {
    return <ExternalVideo data={firstMediaElement} />;
  }
}
```

## Props

| Name     | Type                                                | Description                                                                                                                                                                                                                       |
| -------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| data     | <code>PartialDeep&#60;ExternalVideoType&#62;</code> | An object with fields that correspond to the Storefront API's [ExternalVideo object](https://shopify.dev/api/storefront/reference/products/externalvideo).                                                                        |
| options? | <code>YouTube &#124; Vimeo</code>                   | An object containing the options available for either [YouTube](https://developers.google.com/youtube/player_parameters#Parameters) or [Vimeo](https://vimeo.zendesk.com/hc/en-us/articles/360001494447-Using-Player-Parameters). |

## Component type

The `ExternalVideo` component is a shared component, which means that it renders on both the server and the client. For more information about component types, refer to [React Server Components](https://shopify.dev/custom-storefronts/hydrogen/framework/react-server-components).

## Related components

- [`MediaFile`](https://shopify.dev/api/hydrogen/components/primitive/mediafile)
