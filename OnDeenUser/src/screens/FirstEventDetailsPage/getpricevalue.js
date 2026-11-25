// utils/priceUtils.js
export const getEventPrice = (eventDetail) => {
    const getLowestTicketPrice = (tickets) => {
        if (!tickets || tickets.length == 0) return null;
        const validPrices = tickets
            .map(ticket => Number(ticket.price))
            .filter(price => !isNaN(price) && price > 0);
        return validPrices.length > 0 ? Math.min(...validPrices) : null;
    };

    if (!eventDetail || eventDetail?.price_type == 0) {
        return 'Free';
    }

    const directPrice = Number(eventDetail?.price);
    const ticketPrice = Number(eventDetail?.ticket_price);
    const lowestPrice = !isNaN(directPrice) && directPrice > 0
        ? directPrice
        : !isNaN(ticketPrice) && ticketPrice > 0
            ? ticketPrice
            : getLowestTicketPrice(eventDetail?.tickets);

    return lowestPrice != null && !isNaN(lowestPrice)
        ? `£ ${new Intl.NumberFormat('en-GB').format(lowestPrice)}`
        : 'Free';
};
