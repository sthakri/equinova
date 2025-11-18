import React, { useState } from "react";

import BuyActionWindow from "./BuyActionWindow";
import SellActionWindow from "./SellActionWindow";

const GeneralContext = React.createContext({
  openBuyWindow: (uid) => {},
  openSellWindow: (uid) => {},
  closeTradeWindow: () => {},
});

export const GeneralContextProvider = (props) => {
  const [activeWindow, setActiveWindow] = useState(null);
  const [selectedStockUID, setSelectedStockUID] = useState("");

  const handleOpenBuyWindow = (uid) => {
    setActiveWindow("buy");
    setSelectedStockUID(uid);
  };

  const handleOpenSellWindow = (uid) => {
    setActiveWindow("sell");
    setSelectedStockUID(uid);
  };

  const handleCloseTradeWindow = () => {
    setActiveWindow(null);
    setSelectedStockUID("");
  };

  return (
    <GeneralContext.Provider
      value={{
        openBuyWindow: handleOpenBuyWindow,
        openSellWindow: handleOpenSellWindow,
        closeTradeWindow: handleCloseTradeWindow,
      }}
    >
      {props.children}
      {activeWindow === "buy" && <BuyActionWindow uid={selectedStockUID} />}
      {activeWindow === "sell" && <SellActionWindow uid={selectedStockUID} />}
    </GeneralContext.Provider>
  );
};

export default GeneralContext;
