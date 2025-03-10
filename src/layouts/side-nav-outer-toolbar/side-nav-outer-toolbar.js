import Drawer from "devextreme-react/drawer";
import ScrollView from "devextreme-react/scroll-view";
import React, { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { Header, SideNavigationMenu, Footer } from "../../components";
import "./side-nav-outer-toolbar.scss";
import { useScreenSize } from "../../utils/media-query";
import { Template } from "devextreme-react/core/template";
import { useMenuPatch } from "../../utils/patches";
import { useAuth } from "../../contexts/auth";

export default function SideNavOuterToolbar({ title, children }) {
  const scrollViewRef = useRef(null);
  const navigate = useNavigate();
  const { isXSmall, isLarge } = useScreenSize();
  const [patchCssClass, onMenuReady] = useMenuPatch();

  const { user } = useAuth();
  const [administrator, setAdministrator] = useState(user.administrator);

  // const [menuStatus, setMenuStatus] = useState(
  //   isLarge ? MenuStatus.Opened : MenuStatus.Closed
  // );
  // const { user } = useAuth();
  // const [administrator, setAdministrator] = useState(user.administrator);
  // const toggleMenu = useCallback(({ event }) => {
  //   setMenuStatus((prevMenuStatus) =>
  //     prevMenuStatus === MenuStatus.Closed
  //       ? MenuStatus.Opened
  //       : MenuStatus.Closed
  //   );
  //   event.stopPropagation();
  // }, []);
  const [menuStatus, setMenuStatus] = useState(MenuStatus.Closed);

  const toggleMenu = useCallback(({ event }) => {
    setMenuStatus((prevMenuStatus) =>
      prevMenuStatus === MenuStatus.Closed
        ? MenuStatus.Opened
        : MenuStatus.Closed
    );
    event.stopPropagation();
  }, []);

  const temporaryOpenMenu = useCallback(() => {
    setMenuStatus((prevMenuStatus) =>
      prevMenuStatus === MenuStatus.Closed
        ? MenuStatus.TemporaryOpened
        : prevMenuStatus
    );
  }, []);

  const onOutsideClick = useCallback(() => {
    setMenuStatus((prevMenuStatus) =>
      prevMenuStatus !== MenuStatus.Closed && !isLarge
        ? MenuStatus.Closed
        : prevMenuStatus
    );
    return true;
  }, [isLarge]);

  const onNavigationChanged = useCallback(
    ({ itemData, event, node }) => {
      if (menuStatus === MenuStatus.Closed || !itemData.path || node.selected) {
        event.preventDefault();
        return;
      }

      navigate(itemData.path);
      scrollViewRef.current.instance.scrollTo(0);

      if (!isLarge || menuStatus === MenuStatus.TemporaryOpened) {
        setMenuStatus(MenuStatus.Closed);
        event.stopPropagation();
      }
    },
    [navigate, menuStatus, isLarge]
  );

  useEffect(() => {
    if (administrator !== "Y") {
      // Navigate to the Client Management page when the component mounts
      navigate("/userReporting");
    }
  }, [navigate]);

  return (
    <div className={"side-nav-outer-toolbar"}>
      <Header menuToggleEnabled toggleMenu={toggleMenu} title={title} />
      <Drawer
        className={["drawer", patchCssClass].join(" ")}
        position={"before"}
        closeOnOutsideClick={onOutsideClick}
        openedStateMode={isLarge ? "shrink" : "overlap"}
        revealMode={isXSmall ? "slide" : "expand"}
        minSize={isXSmall ? 0 : 0}
        maxSize={250}
        shading={isLarge ? false : true}
        opened={menuStatus === MenuStatus.Closed ? false : true}
        template={"menu"}
      >
        <div className={"container"}>
          <ScrollView ref={scrollViewRef} className={"layout-body with-footer"}>
            <div className={"content"}>
              {React.Children.map(children, (item) => {
                return item.type !== Footer && item;
              })}
            </div>
            <div className={"content-block"}>
              {React.Children.map(children, (item) => {
                return item.type === Footer && item;
              })}
            </div>
          </ScrollView>
        </div>
        <Template name={"menu"}>
          <SideNavigationMenu
            compactMode={menuStatus === MenuStatus.Closed}
            selectedItemChanged={onNavigationChanged}
            openMenu={temporaryOpenMenu}
            onMenuReady={onMenuReady}
          ></SideNavigationMenu>
        </Template>
      </Drawer>
    </div>
  );
}

const MenuStatus = {
  Closed: 1,
  Opened: 2,
  TemporaryOpened: 3,
};
