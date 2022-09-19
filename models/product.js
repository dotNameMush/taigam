class Product {
    constructor(
        id,
        name,
        desc1,
        desc2,
        category,
        top1,
        top2,
        top3,
        mid,
        bottomList,
        midTitle,
        midTSubtitle,
        headline,
        article,
        quote,
    ) {
        this.id = id;
        this.name = name;
        this.desc1 = desc1;
        this.desc2 = desc2;
        this.category = category;
        this.top1 = top1;
        this.top2 = top2;
        this.top3 = top3;
        this.mid = mid;
        this.bottomList = bottomList;
        this.midTitle = midTitle;
        this.midTSubtitle = midTSubtitle;
        this.headline = headline;
        this.article = article;
        this.quote = quote;
    }
}
module.exports = Product;