import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { setMicroPage } from "store/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { HiChevronRight, HiSparkles, HiChevronDown, HiChevronUp } from "react-icons/hi";

export function SidebarLinks(props) {
  const location = useLocation();
  const dispatch = useDispatch();
  const { routes } = props;
  const { user } = useSelector((state) => state.auth);
  const [hoveredRoute, setHoveredRoute] = useState(null);
  const [expandedMenus, setExpandedMenus] = useState({});

  // Fungsi untuk memeriksa apakah rute aktif berdasarkan path
  const activeRoute = (routeName) => {
    const currentPath = location.pathname.split("?")[0];
    if (routeName.includes(":")) {
      const routeBase = routeName.split("/:")[0];
      return currentPath.startsWith(routeBase);
    }
    return currentPath === routeName || currentPath.startsWith(routeName + "/");
  };

  // Check if any sub-menu is active
  const isSubMenuActive = (subMenus) => {
    return subMenus?.some(subMenu => activeRoute(`${subMenu.layout}/${subMenu.path}`));
  };

  // Toggle sub-menu expansion - only allow one open at a time
  const toggleSubMenu = (index) => {
    setExpandedMenus(prev => {
      // If clicking the same menu that's already open, close it
      if (prev[index]) {
        return { [index]: false };
      }
      // Otherwise, close all menus and open the clicked one
      return { [index]: true };
    });
  };

  // Auto-expand menu if sub-route is active - only one at a time
  useEffect(() => {
    let activeMenuIndex = null;
    
    routes.forEach((route, index) => {
      if (route.subMenus && isSubMenuActive(route.subMenus)) {
        activeMenuIndex = index;
      }
    });
    
    if (activeMenuIndex !== null) {
      setExpandedMenus({ [activeMenuIndex]: true });
    }
  }, [location.pathname, routes]);

  // Menangani rute dengan makro = true
  useEffect(() => {
    const activeMacroRoute = routes.find(
      (route) => route.makro && activeRoute(`${route.layout}/${route.path}`)
    );

    if (activeMacroRoute) {
      dispatch(setMicroPage(activeMacroRoute.name));
    } else {
      dispatch(setMicroPage("unset"));
    }
  }, [routes, location.pathname, dispatch]);

  // Enhanced color scheme based on user role with gradients
  const getRoleColors = () => {
    if (user?.role === 'user') {
      return {
        activeGradient: 'from-purple-500 to-indigo-500',
        activeBg: 'bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30',
        activeText: 'text-purple-700 dark:text-purple-300',
        activeBorder: 'border-purple-200 dark:border-purple-700',
        activeRing: 'ring-purple-500/20',
        hoverBg: 'hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 dark:hover:from-purple-900/20 dark:hover:to-indigo-900/20',
        hoverBorder: 'hover:border-purple-100 dark:hover:border-purple-800',
        hoverShadow: 'hover:shadow-lg hover:shadow-purple-500/10',
        iconGlow: 'group-hover:drop-shadow-sm'
      };
    }
    // Default - admin
    return {
      activeGradient: 'from-indigo-500 to-purple-500',
      activeBg: 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30',
      activeText: 'text-indigo-700 dark:text-indigo-300',
      activeBorder: 'border-indigo-200 dark:border-indigo-700',
      activeRing: 'ring-indigo-500/20',
      hoverBg: 'hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900/20 dark:hover:to-purple-900/20',
      hoverBorder: 'hover:border-indigo-100 dark:hover:border-indigo-800',
      hoverShadow: 'hover:shadow-lg hover:shadow-indigo-500/10',
      iconGlow: 'group-hover:drop-shadow-sm'
    };
  };

  const createLinks = (routes) => {
    const roleColors = getRoleColors();

    return routes.map((route, index) => {
      // Handle sub-menu items
      if (route.subMenus) {
        const isExpanded = expandedMenus[index];
        const hasActiveChild = isSubMenuActive(route.subMenus);

        return (
          <div key={index} className="mb-2">
            {/* Main menu item with sub-menus */}
            <div 
              className={`
                group relative overflow-hidden rounded-xl border transition-all duration-300 cursor-pointer
                ${hasActiveChild 
                  ? `${roleColors.activeBg} ${roleColors.activeBorder} shadow-lg ring-2 ${roleColors.activeRing}` 
                  : `border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 ${roleColors.hoverBg} ${roleColors.hoverBorder} ${roleColors.hoverShadow}`
                }
              `}
              onClick={() => toggleSubMenu(index)}
              onMouseEnter={() => setHoveredRoute(`parent-${index}`)}
              onMouseLeave={() => setHoveredRoute(null)}
            >
              {/* Animated background pattern */}
              <div className={`absolute inset-0 bg-gradient-to-r ${roleColors.activeGradient} opacity-0 ${hasActiveChild ? 'opacity-5' : 'group-hover:opacity-3'} transition-opacity duration-300`}></div>
              
              {/* Active indicator line */}
              {hasActiveChild && (
                <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${roleColors.activeGradient} rounded-r-full`}>
                  <div className="absolute inset-0 bg-white/20 rounded-r-full animate-pulse"></div>
                </div>
              )}

              <li className="relative flex cursor-pointer items-center px-4 py-4 w-full">
                {/* Enhanced icon with modern styling */}
                <div className={`
                  relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300
                  ${hasActiveChild 
                    ? `bg-gradient-to-br ${roleColors.activeGradient} text-white shadow-lg` 
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 group-hover:bg-slate-300 dark:group-hover:bg-slate-600 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                  }
                  ${hoveredRoute === `parent-${index}` ? 'scale-110' : 'scale-100'}
                `}>
                  {route.icon && React.createElement(route.icon, { className: "w-5 h-5" })}
                  
                  {/* Active indicator dot */}
                  {hasActiveChild && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-white shadow-sm">
                      <div className="w-full h-full bg-amber-400 rounded-full animate-ping opacity-75"></div>
                    </div>
                  )}
                </div>

                {/* Enhanced text with better spacing */}
                <div className="flex-1 ml-4">
                  <span className={`
                    block text-sm font-medium transition-colors duration-300
                    ${hasActiveChild 
                      ? `${roleColors.activeText}` 
                      : 'text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'
                    }
                  `}>
                    {route.name}
                  </span>
                  {route.subtitle && (
                    <span className="block text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal">
                      {route.subtitle}
                    </span>
                  )}
                </div>

                {/* Expand/Collapse chevron - only show for sub-menus */}
                {route.subMenus && (
                  isExpanded ? (
                    <HiChevronUp className={`
                      w-4 h-4 transition-all duration-300 
                      ${hasActiveChild 
                        ? `${roleColors.activeText}` 
                        : 'text-slate-400 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-400'
                      }
                    `} />
                  ) : (
                    <HiChevronDown className={`
                      w-4 h-4 transition-all duration-300 
                      ${hasActiveChild 
                        ? `${roleColors.activeText}` 
                        : 'text-slate-400 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-400'
                      }
                    `} />
                  )
                )}
              </li>
            </div>

            {/* Sub-menu items */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="ml-4 mt-2 space-y-1">
                {route.subMenus.map((subRoute, subIndex) => {
                  const routePath = `${subRoute.layout}/${subRoute.path}`;
                  const isActive = activeRoute(routePath);

                  return (
                    <Link key={subIndex} to={routePath}>
                      <div 
                        className={`
                          group relative overflow-hidden rounded-lg border transition-all duration-300
                          ${isActive 
                            ? `${roleColors.activeBg} ${roleColors.activeBorder} shadow-md ring-1 ${roleColors.activeRing} scale-[1.01]` 
                            : `border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 ${roleColors.hoverBg} ${roleColors.hoverBorder} hover:shadow-md hover:scale-[1.01]`
                          }
                        `}
                        onMouseEnter={() => setHoveredRoute(`sub-${index}-${subIndex}`)}
                        onMouseLeave={() => setHoveredRoute(null)}
                      >
                        {/* Animated background pattern */}
                        <div className={`absolute inset-0 bg-gradient-to-r ${roleColors.activeGradient} opacity-0 ${isActive ? 'opacity-5' : 'group-hover:opacity-3'} transition-opacity duration-300`}></div>
                        
                        {/* Active indicator line */}
                        {isActive && (
                          <div className={`absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b ${roleColors.activeGradient} rounded-r-full`}></div>
                        )}

                        <li className="relative flex cursor-pointer items-center px-3 py-3 w-full">
                          {/* Sub-menu icon */}
                          <div className={`
                            relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300
                            ${isActive 
                              ? `bg-gradient-to-br ${roleColors.activeGradient} text-white shadow-md` 
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                            }
                            ${hoveredRoute === `sub-${index}-${subIndex}` ? 'scale-110' : 'scale-100'}
                          `}>
                            {subRoute.icon && React.createElement(subRoute.icon, { className: "w-4 h-4" })}
                          </div>

                          {/* Sub-menu text */}
                          <div className="flex-1 ml-3">
                            <span className={`
                              block text-sm font-medium transition-colors duration-300
                              ${isActive 
                                ? `${roleColors.activeText}` 
                                : 'text-slate-600 dark:text-slate-300 group-hover:text-slate-800 dark:group-hover:text-white'
                              }
                            `}>
                              {subRoute.name}
                            </span>
                            {subRoute.subtitle && (
                              <span className="block text-xs text-slate-400 dark:text-slate-500 mt-0.5 font-normal">
                                {subRoute.subtitle}
                              </span>
                            )}
                          </div>

                          {/* Modern chevron indicator */}
                          <HiChevronRight className={`
                            w-3 h-3 transition-all duration-300 
                            ${isActive 
                              ? `${roleColors.activeText} translate-x-1 opacity-100` 
                              : 'text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 group-hover:translate-x-1 opacity-60 group-hover:opacity-100'
                            }
                          `} />
                        </li>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        );
      }

      // Handle regular menu items (non-sub-menu)
      const routePath = `${route.layout}/${route.path}`;
      const isActive = activeRoute(routePath);

      return (
        <Link key={index} to={routePath}>
          <div 
            className={`
              group relative mb-2 overflow-hidden rounded-xl border transition-all duration-300
              ${isActive 
                ? `${roleColors.activeBg} ${roleColors.activeBorder} shadow-lg ring-2 ${roleColors.activeRing} scale-[1.02]` 
                : `border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 ${roleColors.hoverBg} ${roleColors.hoverBorder} ${roleColors.hoverShadow} hover:scale-[1.01]`
              }
            `}
            onMouseEnter={() => setHoveredRoute(index)}
            onMouseLeave={() => setHoveredRoute(null)}
          >
            {/* Animated background pattern */}
            <div className={`absolute inset-0 bg-gradient-to-r ${roleColors.activeGradient} opacity-0 ${isActive ? 'opacity-5' : 'group-hover:opacity-3'} transition-opacity duration-300`}></div>
            
            {/* Active indicator line */}
            {isActive && (
              <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${roleColors.activeGradient} rounded-r-full`}>
                <div className="absolute inset-0 bg-white/20 rounded-r-full animate-pulse"></div>
              </div>
            )}

            <li className="relative flex cursor-pointer items-center px-4 py-4 w-full">
              {/* Enhanced icon with modern styling */}
              <div className={`
                relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300
                ${isActive 
                  ? `bg-gradient-to-br ${roleColors.activeGradient} text-white shadow-lg` 
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 group-hover:bg-slate-300 dark:group-hover:bg-slate-600 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                }
                ${hoveredRoute === index ? 'scale-110' : 'scale-100'}
              `}>
                {route.icon && React.createElement(route.icon, { className: "w-5 h-5" })}
                
                {/* Active indicator dot */}
                {isActive && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-white shadow-sm">
                    <div className="w-full h-full bg-amber-400 rounded-full animate-ping opacity-75"></div>
                  </div>
                )}
              </div>

              {/* Enhanced text with better spacing */}
              <div className="flex-1 ml-4">
                <span className={`
                  block text-sm font-medium transition-colors duration-300
                  ${isActive 
                    ? `${roleColors.activeText}` 
                    : 'text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'
                  }
                `}>
                  {route.name}
                </span>
                {route.subtitle && (
                  <span className="block text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal">
                    {route.subtitle}
                  </span>
                )}
              </div>

              {/* Subtle hover effect */}
              {hoveredRoute === index && !isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse rounded-xl"></div>
              )}
            </li>
          </div>
        </Link>
      );
    });
  };

  return <ul className="space-y-1">{createLinks(routes)}</ul>;
}

export default SidebarLinks;
