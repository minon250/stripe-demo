// /api/checkout_sessions/route.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    // Mock order data
    const orderData = {
      projectId: 1,
      projectName: "Solomon Islands",
      description: "60,000 hectares of pristine rainforest in the Pacific region with an imminent risk of logging, a high density of endemic species, and indigenous communities who have stewarded the forest for generations.",
      pricePerSquare: 2.418444,
      additionalCO2E: 273.50,
      subTotal: 24.2,
      platformFee: 0.81,
      total: 25.01,
      currencyCode: "GBP",
      numberOfSquares: 10,  // Explicitly set number of squares
      squareMetrics: {
        co2Saved: "0.27 Tonnes",
        treesProtected: "25 Trees",
        landProtected: "10 Square Meters"
      }
    };

    const session = await stripe.checkout.sessions.create({
      allow_promotion_codes: true,
      line_items: [
        {
          price_data: {
            currency: orderData.currencyCode.toLowerCase(),
            unit_amount: Math.round(orderData.pricePerSquare * 100),
            product_data: {
              name: `${orderData.projectName} - Conservation Square`,
              description: `${orderData.description}\n\nImpact Metrics:\n• CO₂ Saved: ${orderData.squareMetrics.co2Saved}\n• Trees Protected: ${orderData.squareMetrics.treesProtected}\n• Land Protected: ${orderData.squareMetrics.landProtected}`,
              images: ["https://picsum.photos/1200/800"], // Larger image size
            },
          },
          quantity: orderData.numberOfSquares,
        },
        {
          price_data: {
            currency: orderData.currencyCode.toLowerCase(),
            unit_amount: Math.round(orderData.platformFee * 100),
            product_data: {
              name: "Platform Fee",
              description: "Processing and platform maintenance fee",
            },
            discounts: [], // Prevents discounts on platform fee
          },
          quantity: 1,
        }
      ],
      mode: 'payment',
      metadata: {
        project_id: orderData.projectId,
        number_of_squares: orderData.numberOfSquares,
        subtotal: orderData.subTotal,
        total: orderData.total,
      },
      success_url: `${request.headers.get('origin')}/?success=true`,
      cancel_url: `${request.headers.get('origin')}/?canceled=true`,
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: `${orderData.projectName} - ${orderData.numberOfSquares} squares`,
          custom_fields: [
            {
              name: 'Number of Squares',
              value: orderData.numberOfSquares.toString(),
            },
            {
              name: 'Price Per Square',
              value: `£${orderData.pricePerSquare.toFixed(2)}`,
            },
            {
              name: 'Platform Fee',
              value: `£${orderData.platformFee.toFixed(2)}`,
            },
            {
              name: 'Environmental Impact',
              value: `CO₂: ${orderData.squareMetrics.co2Saved} | Trees: ${orderData.squareMetrics.treesProtected}`,
            }
          ],
          footer: `Total: £${orderData.total.toFixed(2)}`,
        },
      },
    });

    return Response.json({ url: session.url });
  } catch (err) {
    return new Response(err.message, {
      status: err.statusCode || 500,
    });
  }
}