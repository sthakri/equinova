import React from "react";

function RightSection({ imageURL, productName, productDesription, learnMore }) {
  return (
    <div className="container mt-5">
      <div className="row align-items-center g-4 g-lg-5 flex-column-reverse flex-lg-row">
        <div className="col-lg-6 p-lg-5">
          <h2 className="section-heading mb-3">{productName}</h2>
          <p>{productDesription}</p>
          {learnMore && (
            <div>
              <a href={learnMore} className="equinova-anchor">
                Learn More
              </a>
            </div>
          )}
        </div>
        <div className="col-lg-6">
          <div className="product-image-frame">
            <img src={imageURL} alt={productName} className="img-fluid" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default RightSection;
