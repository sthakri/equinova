import React from "react";

function LeftSection({
  imageURL,
  productName,
  productDesription,
  googlePlay,
  appStore,
}) {
  return (
    <div className="container mt-5">
      <div className="row align-items-center g-4 g-lg-5">
        <div className="col-lg-6">
          <div className="product-image-frame">
            <img src={imageURL} alt={productName} className="img-fluid" />
          </div>
        </div>
        <div className="col-lg-6 p-lg-5">
          <h2 className="section-heading mb-3">{productName}</h2>
          <p>{productDesription}</p>
          {/* Demo and Learn More links removed as requested */}
          {(googlePlay || appStore) && (
            <div className="mt-3 d-flex flex-wrap gap-4">
              {googlePlay && (
                <a href={googlePlay}>
                  <img
                    src="media/images/googlePlayBadge.svg"
                    alt="Get it on Google Play"
                  />
                </a>
              )}
              {appStore && (
                <a href={appStore}>
                  <img
                    src="media/images/appstoreBadge.svg"
                    alt="Download on the App Store"
                  />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LeftSection;
