/// <reference path="jquery-1.8.3.js" />
/// <reference path="jquery-1.8.3-vsdoc.js" />
/// <reference path="JS_lib.js" />


var JS_lib = window.JS_lib || {};
var FOIAWeb = window.FOIAWeb || {};
var Learn = FOIAWeb.Learn || {};
var Request = FOIAWeb.Request || {};
var Search = FOIAWeb.Search || {};
var Contact = FOIAWeb.Contact || {};
var UserControls = FOIAWeb.UserControls || {};

//For /_includes/MainFOIA.master
FOIAWeb.MasterPage = function () {

    "use strict"

    /*
    Adds styling to textboxes and areas and prepares the generic search area.
        
    Variables:
    - SearchBoxID - ID of the search box.
    - SearchButtonID - ID of the search button.
    - SearchBoxes - All Search query input boxes (contains parts of the search terms).
    - SearchTextDefault - Search box default text.
    - MainContentAreaID - Area ID of the main content.
    - LeftMenuAreaID - Area ID of the left menu.
    - SelectedParentStyle - CSS class to apply to the parent menu items of a selected child.
    */
    var OnLoad = function (SearchBoxID, SearchButtonID, SearchBoxes, SearchTextDefault, MainContentAreaID, LeftMenuAreaID) {
        var $SearchBox;

        if (SearchBoxID !== undefined && SearchButtonID !== undefined && SearchBoxes !== undefined && SearchTextDefault !== undefined && MainContentAreaID !== undefined && LeftMenuAreaID !== undefined) {

            //Adds styling to textboxes and textareas on the form
            JS_lib.User_Interface.Text_Focus_Outline(MainContentAreaID + ' input, ' + MainContentAreaID + ' textarea', 'TBfocus', 'TBblur');
            GetParentSelected($(LeftMenuAreaID + " a.selected"), 'selectedParent');
        }

        // configure left navigation menu (specifically display and handling of sub menus)
        var leftNav = $(LeftMenuAreaID + " ul.level1");
        if (leftNav.length > 0) {
            leftNav.find("li a.level1.selected").next().addClass("selected");
        }

        // configure external hyperlinks
        $('a').each(function () {
            var link = $(this);
            var href = new String(link.attr('href'));
            if ((href.indexOf('http') == 0 && href.indexOf('http://' + location.hostname) != 0) || (href.indexOf('https') == 0 && href.indexOf('https://' + location.hostname) != 0)) { // if link is external
                link.click(function () { // prompt user on click
                    if (confirm('You are about to leave the State Department\'s FOIA web site.')) {
                        // open link
                    }
                    else {
                        return false; // do not open link
                    }
                });
                link.attr('target', '_blank'); // ensure link opens in new window/tab
                if (!link.hasClass('Link-External')) { // if link is not already styled
                    var id = new String(link.attr('id'));
                    if (id.indexOf('ExternalLink-') != 0) { // if link is not part of the footer's external links
                        var alt = "This will open this site " + href + "in a new window.";
                        link.append("<img src='bk-externallink.gif' alt='Opens this website " + href + " in new window.' class='Link-External' border='0' />");
                    }
                }
            }
        });

        HandleSearch();
    },

    /*
    Styles parent items as "selected" if the child item is selected.

    Variables:
    - $MenuItem - Menu area with selected items.
    - SelectedParentStyle - CSS class to apply to the parent menu items of a selected child.
    */
    GetParentSelected = function ($MenuItem, SelectedParentStyle) {
        var $ParentSelected;
        if ($MenuItem !== null && SelectedParentStyle !== null) {
            $ParentSelected = $MenuItem.parent().parent().prevUntil("ul");
            if ($ParentSelected.html() !== undefined) {
                $ParentSelected.addClass(SelectedParentStyle);
                GetParentSelected($ParentSelected);
            }
        }
    },

    /*
    Configures various search controls to properly handle when the user presses the "Enter" key.
    */
    HandleSearch = function () {
        var siteSearchEmpty = 'Search the FOIA Site'; // text displayed when site search input element is empty
        var siteSearchCssActive = 'Active'; // CSS class applied when search input element has focus

        // get search controls
        var siteSearch = $('#tbGenericSearch'); // site search
        var homeSearch = $('#tbSearchFOIAinBanner'); // document search on home page
        var docSearch = $('#DocumentSearch-Terms input'); // document search on search page
        var docRefine = $('#searchResultsContent input[name="refineText"]');

        /* Commented out 4/26/2019. It was causing the search to not work on the FOIA_Wide Master page.
        if ($('#searchResultsContent').length > 0 && docRefine.length === 0) { // handles dynamic generation by EXT.JS
            var t = setTimeout(HandleSearch, 1000);
            return;
        }
        */

        var controls = new Array();


        // configure site search
        if (siteSearch.length > 0) {
            // set default control text
            siteSearch.val(siteSearchEmpty);

            // On Focus (input)
            siteSearch.focus(function () {
                // if input is empty (i.e. contains default text)
                if ($(this).val() == siteSearchEmpty) {
                    $(this).val(''); // prepare input (i.e. remove default text)
                }
                $(this).addClass('Active'); // add CSS class for "non-empty" styling
            });

            // On Blur (input)
            siteSearch.blur(function () {
                // if input is mpty
                if ($(this).val().length == 0) {
                    $(this).val(siteSearchEmpty); // set default text
                    $(this).removeClass('Active'); // remove "non-empty" styling (i.e. revert to empty styling)
                }
            });

            // On Key Down (input)
            siteSearch.keydown(function (event) {
                // if "Enter" key is pressed
                if (event.which == 13) {
                    // if control is not empty
                    if ($(this).val().length > 0) {
                        $(this).next().click(); // perform search (i.e. "click" search button)
                    }
                }
            });

            // On Click (button)
            siteSearch.next().click(function () {
                var searchControl = $(this).prev();
                // if input is not empty
                if (searchControl.val().length > 0 && searchControl.val() != siteSearchEmpty) {
                    //window.location.assign('/Search/SiteResults.aspx?q=' + escape(searchControl.val())); // perform search
                    window.location.assign('#' + escape(searchControl.val())); // perform search
                }
            });
        }

        // configure document search (home page)
        if (homeSearch.length > 0) {
            homeSearch.blur(function () { // on blur
                if ($(this).val().length === 0) {
                    $(this).val('');
                }
            });
            homeSearch.keydown(function (event) {
                if (event.which == 13) {
                    $(this).next().click();
                }
            });
            homeSearch.next().click(function () {
                var searchControl = $(this).prev();
                var terms = (searchControl.val().length > 0) ? escape(searchControl.val()) : '*';

                //window.location.assign('/Search/Results.aspx?searchText=' + terms);
                window.location.assign('#' + terms);
            });
        }

        // configure document search (search page)
        if (docSearch.length > 0) {
            docSearch.keydown(function (event) {
                if (event.which == 13) {
                    SubmitSearch(); // note: located in include file
                }
            });
        }

        // configure document refinement (search results page)
        if (docRefine.length > 0) {
            docRefine.keydown(function (event) {
                if (event.which == 13) {
                    $('button[id^="splitbutton"]').click(); // note: located in include file
                }
            });
        }

        // override form submission behavior
        //$('form').unbind('submit');
    };

    return {
        OnLoad: OnLoad
    };
} ();

//For /Default.aspx
FOIAWeb.Home = function () {

    "use strict"

    //Private Members
    var allBanners, allLinks, allLinkDividers, linkContainer, currIdx,
        LinkSelectedClass = "SelectedBannerLink",
        LinkRegClass = "BannerLink",
        DividerInactiveHoverClassLeft = "inactive-left-hover",
        DividerInactiveHoverClassRight = "inactive-right-hover",
        DividerSelectedHoverClassLeft = "active-left-hover",
        DividerSelectedHoverClassRight = "active-right-hover",
        DividerSelectedClassLeft = "active-left",
        DividerSelectedClassRight = "active-right",

    /*
    Sets up the banner visibility on load.

    Variables:
    - LinkContainerId - ID of the panel containing the links for changing banners.
    - TotalDocLabelID - ID of the label displaying the total number of documents.
    - HomeTotalDocLabelID - ID of the label displaying the total number of documents in the home banner.
    - RecordsContainerID - ID of the container for showing DoS records.
    - AnnouncementsXMLFile - Location of the Announcements XML file.
    */
        OnLoad = function (LinkContainerId, TotalDocLabelID, HomeTotalDocLabelID, RecordsContainerID, AnnouncementsXMLFile) {
            var $Records;
            if (LinkContainerId !== null && TotalDocLabelID !== null && HomeTotalDocLabelID !== null && RecordsContainerID && AnnouncementsXMLFile) {
                GetDocCount(TotalDocLabelID, "Currently ");
                GetDocCount(HomeTotalDocLabelID, "");
                allBanners = $(".FOIATextBanner");
                linkContainer = $("#" + LinkContainerId);
                allLinks = linkContainer.find("a");
                allLinkDividers = linkContainer.find("span");
                currIdx = 0;

                // configure "Department of State Records" section
                var minRecords = 4; // specifies how many records should be visible when the section is collapsed
                $Records = $(RecordsContainerID);
                $Records.find('.body .content li').each(function (i) { // hide records, if necessary
                    if (i >= minRecords) {
                        $(this).hide();
                    }
                });
                $Records.find('.body').append('<div class="more"><a href="javascript:void(0);">Show More</a></div>'); // create expand/collapse control
                $Records.find('.more a').click(function () { // configure expand/collapse control
                    if ($(this).text() == 'Show More') { // expand
                        $Records.find(".body .content li:hidden").slideDown();
                        $(this).html('Show Less');
                    }
                    else { // collapse
                        $Records.find('.body .content li').each(function (i) {
                            if (i >= minRecords) {
                                $(this).slideUp();
                            }
                        });
                        $(this).html('Show More');
                    }
                });

                // set onhover to toggle dividers properly
                allLinks.mouseover(function () {
                    if ($(this).hasClass("SelectedBannerLink") === false) { // if link is not selected
                        var prev = $(this).prev();
                        if (prev.hasClass(DividerSelectedClassRight)) {
                            prev.addClass(DividerSelectedHoverClassRight);
                        }
                        else {
                            prev.addClass(DividerInactiveHoverClassLeft);
                        }

                        var next = $(this).next();
                        if (next.hasClass(DividerSelectedClassLeft)) {
                            next.addClass(DividerSelectedHoverClassLeft);
                        }
                        else {
                            next.addClass(DividerInactiveHoverClassRight);
                        }
                    }
                });
                allLinks.mouseout(function () {
                    if ($(this).hasClass("SelectedBannerLink") === false) { // if link is not selected
                        var prev = $(this).prev();
                        if (prev.hasClass(DividerSelectedHoverClassRight)) {
                            prev.removeClass(DividerSelectedHoverClassRight);
                        }
                        else {
                            prev.removeClass(DividerInactiveHoverClassLeft);
                        }

                        var next = $(this).next();
                        if (next.hasClass(DividerSelectedHoverClassLeft)) {
                            next.removeClass(DividerSelectedHoverClassLeft);
                        }
                        else {
                            next.removeClass(DividerInactiveHoverClassRight);
                        }
                    }
                });

                //Shows the first banner via animation only if it's already hidden. If this is not checked, there could be issues with postbacks and navigating back to this page.
                if (allBanners.eq(currIdx).css("display") === "none")
                    allBanners.eq(currIdx).animate({ opacity: 'toggle' }, 0);
                StyleSelectedBannerLink(currIdx);
                HideShowArrows("#RightArrowOver", "arrowright.png", "right", 1);
                //If a hashed number was passed in, then it was likely a banner index.
                //ValueOf ensures that a number is passed in. Without this, if returning to the first banner 0, a transition would occur (when it shouldn't).
                //Ensure that the animation will run at a speed of 0 so that the "home" banner won't be visible for long before this occurs.
                if (location.hash !== "")
                    GoToBanner(new Number(location.hash.replace("#", "")).valueOf(), 0);
                ReSize_Links();

                //Only show the 'What's New' link if there is at least one recent announcement.
                $.when(Learn.New.HasAnnouncements(AnnouncementsXMLFile)).done(function (FoundAnnouncement) {
                    if (FoundAnnouncement)
                        $('#WhatsNew').show();
                });
            }
        },

    /*
    Shows the index of the selected banner and hides the old selection.

    Variables:
    - SelectedIdx - 0 based index of the area to be selected.
    - NewAnimationTime - Alternate time to run animation (can be undefined).
    */
        GoToBanner = function (SelectedIdx, NewAnimationTime) {
            var BannerDirection;

            //Ensure that all animations are already completed.
            allBanners.filter(":animated").promise().done(function () {
                //Double-check that all animations are complete, since some can be missed by the earlier statement.
                if ($(this).length === 0) {
                    if (SelectedIdx !== null && (SelectedIdx !== currIdx)) {
                        //If selecting a banner to the right, then ensure that animation occurs in that direction and vice versa.
                        if (currIdx < SelectedIdx)
                            BannerDirection = JS_lib.Enumerations.LR.LEFT;
                        else
                            BannerDirection = JS_lib.Enumerations.LR.RIGHT;
                        location.hash = SelectedIdx;
                        AnimateBanners(allBanners.eq(currIdx), allBanners.eq(SelectedIdx), BannerDirection, NewAnimationTime);
                        StyleSelectedBannerLink(SelectedIdx);

                        //Setup hover arrow links
                        if (SelectedIdx > 0)
                            HideShowArrows("#LeftArrowOver", "arrowleft.png", "left", SelectedIdx - 1);
                        else //Hide the left arrow and remove all events if on the first banner.
                            $("#LeftArrowOver").mouseleave().off("click mouseenter mouseleave");
                        //If on the last slide, then the total count of banners - 1 will be = the current index.
                        if (SelectedIdx < allBanners.length - 1)
                            HideShowArrows("#RightArrowOver", "arrowright.png", "right", SelectedIdx + 1);
                        else //Hide the right arrow and remove all events if on the last banner.
                            $("#RightArrowOver").mouseleave().off("click mouseenter mouseleave");
                        currIdx = SelectedIdx;
                    }

                    allLinks.eq(SelectedIdx).blur(); // blur link to remove outline in IE
                }
            });
        },

    /*
    Sets up the click and mouseover/out events for the arrow links.

    Variables:
    - ArrowID - ID of the arrow item.
    - ArrowURL - File name and extension of the arrow file.
    - ArrowDirection - Direction the arrow icon will be facing.
    - GotoIdx - Banner index the banner will go to if the arrow is selected.
    */
        HideShowArrows = function (ArrowID, ArrowURL, ArrowDirection, GotoIdx) {
            if (ArrowID && ArrowURL && ArrowDirection && GotoIdx >= 0) {
                $(ArrowID).off("click mouseenter mouseleave");
                $(ArrowID).on("click", function () {
                    GoToBanner(GotoIdx);
                });
                $(ArrowID).hover(function () {
                    $(this).css({ "background": "url('_includes/Images/" + ArrowURL + "') no-repeat center " + ArrowDirection, "cursor": "pointer" });
                },
                function () {
                    //Since IE doesn't like transparent, something (in this can a nonexistent image) has to be set to the background url.
                    $(this).css({ "background": "url('_includes/Images/nonexistentimage.png') no-repeat center", "cursor": "inherit" });
                });
            }
        },

    /*
    Resizes the banner links to fit the width of the screen and moves them underneath the banner.
    */
    ReSize_Links = function () {
        var LinkWidth, TempPadding, $FirstBanner, PanelLinkID, LinkPanelID, $FirstLink;

        if (allBanners) {
            LinkPanelID = ".BannerLinkPanel";
            PanelLinkID = LinkPanelID + " a";
            $FirstBanner = allBanners.first();
            $FirstLink = $(PanelLinkID).first();
            //Width of each individual link.
            LinkWidth = $FirstBanner.width() / $(PanelLinkID).length;
            //Modern browsers will fill only as needed to fit the area. Ancient ones will force
            //their content below.
            if (JS_lib.ByBrowser.IsModern())
                LinkWidth = Math.round(LinkWidth);
            else
                LinkWidth = Math.floor(LinkWidth);
            //The number of banners must match the number of links 
            if (allBanners.length !== $(PanelLinkID).length)
            //alert("THE NUMBER OF BANNERS (" + allBanners.length + ") AND THEIR CORRESPONDING LINKS (" + $(PanelLinkID).length + ") SHOULD EQUAL OR ELSE THE LINK SIZE WILL BE WRONG!!");
                $(PanelLinkID).each(function () {
                    //Find what the total padding should be (by removing the content's width), then divide by 2 to get the padding for each side (L & R).
                    //Modern browsers will fill only as needed to fit the area. Ancient ones will force
                    //their content below.
                    if (JS_lib.ByBrowser.IsModern())
                        TempPadding = Math.round((LinkWidth - $(this).width()) / 2);
                    else
                        TempPadding = Math.floor((LinkWidth - $(this).width()) / 2);
                    $(this).css({ "padding-left": TempPadding + "px", "padding-right": TempPadding + "px" });
                });
            if (JS_lib.ByBrowser.IsModern())
                TempPadding = $FirstBanner.height() + new Number($FirstLink.css("border-top-width").replace("px", "")) + new Number($FirstLink.css("padding-top").replace("px", ""));
            else
                TempPadding = $FirstBanner.height();

            //alert("banner height: " + $FirstBanner.height() + ".btw: " + $FirstLink.css("border-top-width") + ".pt: " + $FirstLink.css("padding-top") + ".mt: " + $FirstLink.css("margin-top") + ".");
            //Since the banner is absolutely positioned, the links beneath it will need padding to be placed above to accomodate the banner height, link padding, and link border size.
            $(LinkPanelID).css("padding-top", TempPadding + "px");
        }
    },

    /*
    Styles the currently selected banner's link.
            
    Variables:
    SelectedIdx - Link order number selected (0 based)
    */
        StyleSelectedBannerLink = function (SelectedIdx) {
            if (SelectedIdx !== null) {
                // reset other links
                allLinkDividers.removeClass(DividerSelectedClassLeft).removeClass(DividerSelectedClassRight);
                allLinkDividers.removeClass(DividerSelectedHoverClassLeft).removeClass(DividerSelectedHoverClassRight);
                allLinkDividers.removeClass(DividerInactiveHoverClassLeft).removeClass(DividerInactiveHoverClassRight);

                // set link
                var link = allLinks.eq(SelectedIdx);
                link.addClass(LinkSelectedClass);
                link.prev().addClass(DividerSelectedClassLeft);
                link.next().addClass(DividerSelectedClassRight);
                //If these are the same (this is the first time loading), then will not need to change the classes
                //of the previously selected button.
                if (SelectedIdx !== currIdx)
                    allLinks.eq(currIdx).removeClass(LinkSelectedClass).addClass(LinkRegClass);
            }
        },

    /*
    OnKeyPress for the search box. If the enter key is pressed, the user is forwarded to the search page.
            
    Variables:
    $FOIASearchBox - Search Box Object
    */
        SearchBoxOnPress = function ($FOIASearchBox) {
            var KeyPressed;

            //Return the key that is pressed (IE, then non-antique browsers)
            if (window.event)
                KeyPressed = event.keyCode;
            else if (event.which)
                KeyPressed = event.which;
            //Return key is pressed
            if (KeyPressed === 13) {
                ForwardtoSearch($FOIASearchBox);
                //Prevent page from posting back (IE, then non-antique browsers)
                if (event.returnValue)
                    event.returnValue = false;
                else
                    event.preventDefault();
            }
        },

    /*
    The user is forwarded to the search page.
            
    Variables:
    $FOIASearchBox - Search Box Object
    */
        ForwardtoSearch = function ($FOIASearchBox) {
            //if ($FOIASearchBox) {
            //At least some text needs to be in the search box.
            //    if ($FOIASearchBox.val().length > 2)
            //        window.location = "Search/Results.aspx?searchText=" + escape($FOIASearchBox.val());
            //}
        },



    /*
    Animates the banner to hide previous selection and show the current one.

    Variables:
    - $HidingItem - jQuery banner to be hidden.
    - $ShowingItem - jQuery banner to be shown.
    - Direction - Enumerations.LR object direction to move the banners.
    - NewAnimationTime - Alternate animation time (can be undefined).
    */
    AnimateBanners = function ($HidingItem, $ShowingItem, BannerDirection, NewAnimationTime) {
        var Movement, TransitionTime, TransitionType, OriginalPosition;

        if ($HidingItem && $ShowingItem && BannerDirection) {
            if (NewAnimationTime === undefined)
                TransitionTime = 400;
            else
                TransitionTime = NewAnimationTime;
            TransitionType = "swing";
            Movement = $HidingItem.width();
            //Since the items are absolute, their initial placement should be at left:0
            OriginalPosition = 0;

            //alert("OP: " + OriginalPosition + "." + BannerDirection.htmlmod + "." + eval(OriginalPosition + BannerDirection.htmlmod + Movement) + ".");
            $HidingItem.css("left", OriginalPosition);
            //Have the showing item move away from the rest of the banners, so it will slide into position when animating.
            //Have to eval since it will be converted to a string, otherwise.
            $ShowingItem.css("left", eval(OriginalPosition + BannerDirection.htmlmodopp + Movement));

            $HidingItem.animate({ left: BannerDirection.htmlmod + "=" + Movement + "px", opacity: 'toggle' }, { queue: false, duration: TransitionTime, easing: TransitionType });
            $ShowingItem.animate({ left: BannerDirection.htmlmod + "=" + Movement + "px", opacity: 'toggle' }, { queue: false, duration: TransitionTime, easing: TransitionType });
        }
    },

    /*
    Retrieves the total number of documents and displays it in a tag.

    Variables:
    - TotalDocLabelID - ID of the label displaying the total number of documents.
    - PrefixLabel - Text to display before the count.
    */
    GetDocCount = function (TotalDocLabelID, PrefixLabel) {
        if (TotalDocLabelID !== null && PrefixLabel !== null) {
            try {
                //alert("doc is TotalDocLabelID " + $(TotalDocLabelID).length + ".");
                $.get("/api/Search/GetTotalDocs", function (data) {
                    //alert("received doc? " + data + ".");
                    if (isNaN(data)) {
                        //console.log('total docs loaded from get: 0');
                    }
                    else{
                        //console.log('total docs loaded from get: ' + data);
                        $(TotalDocLabelID).html(PrefixLabel + JS_lib.Formatting.commaSeparateNumber(data) + " searchable documents");
                    }
                    //$(TotalDocLabelID).html(PrefixLabel + JS_lib.Formatting.commaSeparateNumber(data) + " searchable documents");
                });
            }
            catch (exp) {
                alert("error getting doc count: " + exp + ".");
            }
        }
    };

    //Public interface
    return {
        OnLoad: OnLoad,
        GoToBanner: GoToBanner,
        ForwardtoSearch: ForwardtoSearch,
        SearchBoxOnPress: SearchBoxOnPress
    };
} ();

//For /Learn/FAQ
Learn.FAQ = function () {

    "use strict"

    var OnLoad = function () {
        // configure collapsible content
        $('.FAQ-Section').each(function (i) {
            var item = $(this).find('li').each(function () {
                var question = $(this).children("a");
                var answer = $(this).find('div');

                question.attr('href', 'javascript:void(0);').click(function () {
                    var answer = $(this).next();
                    if (answer.is(':visible')) {
                        $('.FAQ-Section div:visible').slideUp();
                    }
                    else {
                        $('.FAQ-Section div:visible').slideUp();
                        $(this).next().slideDown();
                    }
                });

                answer.hide();
            });
        });

        // add instructional message for collapsible content
        $('#Introduction').after('<div class="InfoMessage"><p class="Header">How-To</p><p>To view the response to a frequently asked question, click on the question.</p></div>');

        // configure tabbed navigation
        var contentContainers = $('#uplMainContent div.tab').each(function () {
            var name = $(this).find('h2').text();
            $(this).attr('name', name);
        });
        contentContainers.tabs({ pointer: true });
    };

    //Public interface
    return {
        OnLoad: OnLoad
    };

} ();

//For /Learn/UserGuide.aspx
Learn.UserGuide = function () {

    "use strict"

    //Private variables
    var FloatMenuID = "#floatMenu",

    /*
    Positions the top menu on load, scroll, and resize.
    Registered as a startup script during the server pageload event.
    */
    OnLoad = function (LeftMenuID) {
        if (LeftMenuID != null) {
            //var $LeftMenu = $('#LeftMenuArea').first();
            var $LeftMenu = $('#' + LeftMenuID).first();

            //Hide on initial load since already showing TOC at the top.
            positionTOC($LeftMenu);
            $(window).resize(function () {
                positionTOC($LeftMenu);
            });
            //$(window).scroll(function () {
            //    $(FloatMenuID).animate({ top: GetTOCTop($LeftMenu) }, { duration: 400, queue: false });
            //    ShowHideTOC($LeftMenu);
            //alert('menuyloc: ' + menuYloc + '. offset: ' + offset + '.leftmenutop: ' + $LeftMenu.position().top + '.leftmenuheight: ' + $LeftMenu.outerHeight() + ".scrolltop: " + $(document).scrollTop() + ".");
            //});
        }
        //Sets up the smooth scrolling.
        $('a[href*=#]:not([href=#])').click(function () {
            if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
                var target = $(this.hash);
                target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
                if (target.length) {
                    $('html,body').animate({
                        scrollTop: target.offset().top
                    }, 1000);
                    return false;
                }
            }
        });
    },

    /*
    Shows the table of contents if we're past the bottom of the left menu. Hides it otherwise.

    References: jQuery
    Variables:
    - $LeftMenu - Left Menu Object
    */
        ShowHideTOC = function ($LeftMenu) {
            var LeftMenuBottom, DocumentTop;

            if ($LeftMenu != undefined) {
                LeftMenuBottom = $LeftMenu.position().top + $LeftMenu.outerHeight();
                DocumentTop = $(document).scrollTop();

                if (DocumentTop <= LeftMenuBottom) {
                    $(FloatMenuID).css({ "display": "none" });
                }
                else {
                    $(FloatMenuID).css({ "display": "block" });
                }
            }
        },

    /*
    Repositions the left menu table of contents.

    References: jQuery
    Variables:
    - $LeftMenu - Left Menu Object
    */
        positionTOC = function ($LeftMenu) {
            var position;

            if ($LeftMenu != undefined) {
                position = $LeftMenu.position();

                //alert("menu left: " + position.left + ".menu lp: " + $LeftMenu.css('padding-left') + ".menu ml: " + $LeftMenu.css('margin-left') + ".");
                $(FloatMenuID).css({ 'left': position.left + new Number($LeftMenu.css('padding-left').replace("px", "")) + new Number($LeftMenu.css('margin-left').replace("px", "")) });
                $(FloatMenuID).css({ 'top': GetTOCTop($LeftMenu) });
                //$("#floatMenu").css({ 'top': position.top + new Number($LeftMenu.outerHeight()) });
                ShowHideTOC($LeftMenu);

            }
        },

    /*
    Returns the location of where the top edge of the table of contents should be.

    References: jQuery
    Variables:
    - $LeftMenu - Left Menu Object
    */
        GetTOCTop = function ($LeftMenu) {
            var LeftMenuBottom, DocumentTop;

            if ($LeftMenu != undefined) {
                LeftMenuBottom = $LeftMenu.position().top + $LeftMenu.outerHeight();
                DocumentTop = $(document).scrollTop();

                //If the left menu is still on the screen, then ensure that it appears below it,
                //else, have it appear near the top of the page.
                //2012-07-02: Hide the TOC side menu since already at the top of the page.
                if (DocumentTop <= LeftMenuBottom)
                    return LeftMenuBottom;
                else
                    return DocumentTop + 10;
            }
            else
                return 0;
        };

    //Public Interface
    return {
        OnLoad: OnLoad
    };
} ();

//For /Learn/New
Learn.New = function () {

    "use strict"

    var OnLoad = function () {
        var announcements = $('#News li');
        announcements.hover(
            function () {
                $(this).addClass('hover');
            },
            function () {
                $(this).removeClass('hover');
            }
        );
        announcements.each(function () {
            var body = $(this).find('div.body');
            if (body.length > 0) {
                body.after('<a href="javascript:void(0);" onclick="Learn.New.ToggleAnnouncement(this)" class="toggle">Read More</a>');
            }
        });
    },

    /*
    Returns whether there are any announcments that should be displayed.

    References: jQuery
    Variables:
    - AnnouncementsXMLFile - Announcements XML file location.
    */
    HasAnnouncements = function (AnnouncementsXMLFile) {
        var deferred = $.Deferred();

        if (AnnouncementsXMLFile) {
            // display "What's New" hyperlink (if appropriate)
            $.get(AnnouncementsXMLFile, function (data, status) {
                // get rows
                var rows = (navigator.userAgent.indexOf('Edge') >= 0) ? data.getElementsByTagName('row') : data.getElementsByTagName('z:row');
                //var rows = (navigator.appName === 'Microsoft Internet Explorer' || navigator.appVersion.indexOf('rv:11') !== -1) ? data.getElementsByTagName('z:row') : data.getElementsByTagName('row');
                // check expiration date of each announcement
                var expiryCount = 0;
                var currentDate = new Date();
                $(rows).each(function (i) {
                    var iRow = $(rows[i]);

                    var iExpiry = new Date(iRow.attr('ows_Hide_x0020_Date').split(" ")[0]);
                    var iShow = new Date(iRow.attr('ows_Publish_x0020_Date').split(" ")[0]);
                    if (iExpiry < currentDate || iShow > currentDate) {
                        expiryCount++;
                    }
                });

                // if one or more announcements are not expired
                if (rows.length > expiryCount)
                    deferred.resolve(true);
                else
                    deferred.resolve(false);
            });
        }
        else
            deferred.resolve(false);
        return deferred;
    },

    ToggleAnnouncement = function (link) {
        var linkText = ($(link).prev().is(':visible')) ? 'Read More' : 'Show Less';
        $(link).prev().slideToggle();
        $(link).html(linkText);
    };

    //Public interface
    return {
        OnLoad: OnLoad,
        ToggleAnnouncement: ToggleAnnouncement,
        HasAnnouncements: HasAnnouncements
    };

} ();

//For /Learn/RecordsDisposition
Learn.RecordsDisposition = function () {

    "use strict"

    var OnLoad = function () {
        $('#uplMainContent .LinkContent .LinkList').each(function () {
            var name = $(this).prev().text();
            $(this).parent().addClass('tab').attr('name', name);
        });

        $('#uplMainContent .LinkContent.tab').tabs({ buttons: false, progressive: false });

        return;
    };

    //Public interface
    return {
        OnLoad: OnLoad
    };

} ();

// For /Learn/Reports
Learn.Reports = function () {

    "use strict"

    var OnLoad = function () {
        // configure "Download" hyperlinks
        $('.ReportTable a').each(function () {
            var title = 'Download "' + $(this).parent().prev().text() + '" as ' + $(this).text();
            $(this).attr('title', title);
        });

        // configure row hover behavior
        $('.ReportTable td').hover(function () {
            $(this).parent().toggleClass('active');
        });

        // configure tabbed navigation
        var contentContainers = $('#uplMainContent div.tab').each(function () {
            var name = $(this).find('h2').text();
            $(this).attr('name', name).removeClass('TopSection');
        });
        contentContainers.tabs({ buttons: false, progressive: false });
    };

    //Public interface
    return {
        OnLoad: OnLoad
    };

} ();

//For /Request/Submit
Request.Submit = function () {

    "use strict"
    //Don't use the name "arguments" as an argument variable name or else strict cannot be set.

    /*
    Sets up the modal help links and checks to see if all necessary form fields are filled in.
    Also, sets up the date fields.

    References: jQuery, jQuery UI
    Variables:
    - StartDateID - Start Date Field Identifier.
    - EndDateID - End Date Field Identifier.
    - inpcbPresentDate - End Date "Present" checkbox ID.
    - spanEndDatePresentPrefix - ID of text displaying after the "Present" checkbox.
    - divEndDatePresentSuffix - ID of the text displaying after the End Date field.
    - SubmitHelpFile - Location of XML Help File.
    - AppRoot - Root of the application.
    - divStartDateErrorID - ID of the container that will display a start date error.
    - divEndDateErrorID - ID of the container that will display a end date error.
    */
    var OnLoad = function (StartDateID, EndDateID, inpcbPresentDate, spanEndDatePresentPrefix, divEndDatePresentSuffix, SubmitHelpFile, AppRoot, divStartDateErrorID, divEndDateErrorID) {
        var manager = Sys.WebForms.PageRequestManager.getInstance();
        var TodaysDate, MinimumDate, YearDifference, CalIconLocation;

        //Remove the scrollposition or else the position will be at the bottom after each time the continue, back, or tabs are selected.
        manager._scrollPosition = null;
        if (SubmitHelpFile !== null && AppRoot !== null)
            JS_lib.User_Interface.Open_Modal('a[name=modal]', '#mask', '.ModalWindow', '.close', '.ModalMainContent', SubmitHelpFile, AppRoot, '.print');

        if (StartDateID !== null && EndDateID !== null) {
            TodaysDate = new Date();
            MinimumDate = null;
            //YearDifference = MinimumDate.getFullYear() - TodaysDate.getFullYear();
            CalIconLocation = "/_includes/images/calendar2.gif";

            //When the input box loses focus. Do not want to check when its blank or else it will clear the field after the calendar button is selected.
            //The onClose for the datepicker only handles when the calendar, itself, closes.
            $(StartDateID).blur(function () {
                JS_lib.User_Interface.Validate_Input.ValidateDateRange(StartDateID, $(this).val(), TodaysDate, MinimumDate, EndDateID, true, divStartDateErrorID);
            });
            $(EndDateID).blur(function () {
                JS_lib.User_Interface.Validate_Input.ValidateDateRange(EndDateID, $(this).val(), TodaysDate, MinimumDate, StartDateID, false, divEndDateErrorID);
            });
            //Setup Date Fields
            $(StartDateID).datepicker({
                defaultDate: null,
                changeMonth: true,
                changeYear: false,
                showOn: "button",
                buttonImage: CalIconLocation,
                buttonImageOnly: true,
                buttonText: 'Select Start Date',
                maxDate: TodaysDate,
                minDate: MinimumDate,
                stepMonths: 12,
                //yearRange: YearDifference + ":+0",
                onClose: function (selectedDate) {
                    JS_lib.User_Interface.Validate_Input.ValidateDateRange(StartDateID, selectedDate, TodaysDate, MinimumDate, EndDateID, true, divStartDateErrorID);
                }
            });
            $(EndDateID).datepicker({
                defaultDate: null,                
                changeMonth: true,
                changeYear: false,
                showOn: "button",
                buttonImage: CalIconLocation,
                buttonImageOnly: true,
                buttonText: 'Select End Date',
                maxDate: TodaysDate,
                minDate: MinimumDate,
                stepMonths: 12,
                //yearRange: YearDifference + ":+0",
                onClose: function (selectedDate) {
                    JS_lib.User_Interface.Validate_Input.ValidateDateRange(EndDateID, selectedDate, TodaysDate, MinimumDate, StartDateID, false, divEndDateErrorID);
                }
            });
            //On load, show/hide end date components.
            EndDateVisibility(EndDateID, inpcbPresentDate, spanEndDatePresentPrefix, divEndDatePresentSuffix, false, divEndDateErrorID);
            $(inpcbPresentDate).change(function () {
                EndDateVisibility(EndDateID, inpcbPresentDate, spanEndDatePresentPrefix, divEndDatePresentSuffix, true, divEndDateErrorID);
            }).next().click(function () {
                $(inpcbPresentDate).click();
            });
        }
    },

    /*
    Shows/Hides the end date and related values.

    References: jQuery
    Variables:
    - EndDateID - End Date Field Identifier.
    - inpcbPresentDate - End Date "Present" checkbox ID.
    - spanEndDatePresentPrefix - ID of text displaying after the "Present" checkbox.
    - divEndDatePresentSuffix - ID of the text displaying after the End Date field.
    - divEndDateErrorID - ID of the container that will display a end date error.
    */
    EndDateVisibility = function (EndDateID, inpcbPresentDate, spanEndDatePresentPrefix, divEndDatePresentSuffix, IsPostBack, divEndDateErrorID) {
        var DateVisibility, DateValue;

        if (EndDateID !== undefined && inpcbPresentDate !== undefined && spanEndDatePresentPrefix !== undefined && divEndDatePresentSuffix !== undefined && IsPostBack !== undefined && divEndDateErrorID !== undefined) {
            if ($(inpcbPresentDate).attr("checked") !== "checked") {
                DateVisibility = "visible";
                DateValue = "";
            }
            else {
                DateVisibility = "hidden";
                DateValue = JS_lib.User_Interface.Validate_Input.getDateinFormat(new Date());
                //If the checkbox is "checked", then clear out any existing errors relating to it.
                $(divEndDateErrorID).text("");
            }
            //Only want to change the value during the onchange event, not on the initial load.
            if (IsPostBack)
                $(EndDateID).val(DateValue);
            //Modifies the end date and the calendar icon's visibility.
            $(EndDateID).css("visibility", DateVisibility).next().css("visibility", DateVisibility);
            $(spanEndDatePresentPrefix).css("visibility", DateVisibility);
            $(divEndDatePresentSuffix).css("visibility", DateVisibility);
        }
    };

    //Public interface
    return {
        OnLoad: OnLoad
    };
} ();

//For /Request/Worksheet
Request.Worksheet = function () {

    "use strict"

    /*
    Sets up the modal help links and checks to see if all necessary form fields are filled in.

    References: jQuery
    Variables:
    - InstructionFileURL - ID of the field that will hold the instruction content.
    - ApplicationRoot - Application starting folder.
    */
    var OnLoad = function (InstructionFileURL, ApplicationRoot) {
        if (InstructionFileURL !== null && ApplicationRoot !== null) {
            $(".InstructionLinks").die("click").live("click", function (e) {
                Show_Instructions(e, InstructionFileURL, ApplicationRoot);
            });
        }
    },

    /*
    Shows instructions related to a specific User Guide item.
    */
    Show_Instructions = function (e, InstructionFileURL, ApplicationRoot) {
        //Cancel the link behavior         
        e.preventDefault();
        JS_lib.User_Interface.Open_Basic_Modal_w_Data('#mask', '.ModalWindow', '.close', '.ModalMainContent', InstructionFileURL, ApplicationRoot, "SubSection[id=", "Where to Make a FOIA Request", "Learn/UserGuide.aspx#RequestingInformationundertheFreedomofInformationAct(FOIA)", ".print");
    };

    //Public interface
    return {
        OnLoad: OnLoad
    };

} ();

//For /Request/Checklist...(3 files)
Request.ThirdPartyAuthorization = function () {

    "use strict"

    /*
    ID of the authorization content in the help xml file.
    */
    var AUTHORIZATION_ID = function () {
        return "ThirdPartyAuthorization";
    },

    /*
    Retrievs the authorization content.

    References: jQuery
    Variables:
    - DescriptionLocationID - ID of the field that will hold the authorization content.
    - AuthorizationFileURL - XML file of the authorization help content.
    */
    OnLoad = function (DescriptionLocationID, AuthorizationFileURL) {
        var $HelpItem;

        if (DescriptionLocationID !== null && AuthorizationFileURL !== null) {
            $.ajax({
                type: "GET",
                url: AuthorizationFileURL,
                dataType: "xml",
                error: function (jqXHR, textStatus, errorThrown) {
                    alert('Error retrieving Authorization content: ' + textStatus + ':' + errorThrown + '.');
                },
                success: function (xml) {
                    $HelpItem = $(xml).find('Help[id=' + AUTHORIZATION_ID() + ']').first();
                    if ($HelpItem !== null)
                        $(DescriptionLocationID).html($HelpItem.find('Description').text());
                }
            });
        }
    },

    /*
    Sets up the modal to display authorization content.

    References: jQuery
    Variables:
    - ThirdPartyAuthorizationLinkID - ID of the link activating this modal.
    - ApplicationRoot - Application Root.
    - AuthorizationFileURL - XML file of the authorization help content.
    */
    SetupModal = function (ThirdPartyAuthorizationLinkID, ApplicationRoot, AuthorizationFileURL) {
        if (ThirdPartyAuthorizationLinkID !== null && AuthorizationFileURL !== null && ApplicationRoot !== null) {
            $(ThirdPartyAuthorizationLinkID).die("click").live("click", function (e) {
                Show_AuthorizationForm(e, AuthorizationFileURL, ApplicationRoot);
            });
        }
    },

    /*
    Shows instructions related to a specific User Guide item.

    Variables:
    - AuthorizationFileURL - XML file of the authorization help content.
    - ApplicationRoot - Application Root.
    */
    Show_AuthorizationForm = function (e, AuthorizationFileURL, ApplicationRoot) {
        //Cancel the link behavior         
        e.preventDefault();
        JS_lib.User_Interface.Open_Basic_Modal_w_Data('#mask', '.ModalWindow', '.close', '.ModalMainContent', AuthorizationFileURL, ApplicationRoot, "Help[id=", AUTHORIZATION_ID(), "Request/ThirdPartyAuthorization.aspx", '.print');
    };

    //Public interface
    return {
        OnLoad: OnLoad,
        SetupModal: SetupModal
    };

} ();

//For /Request/Fees
Request.Fees = function () {

    "use strict"

    /*
    Retrieves the fees content.

    References: jQuery
    Variables:
    - DescriptionLocationID - Array of IDs of the field that will hold the fee contents.
    - TitleLocationIDs - Array of IDs of the field that will hold the fee title.
    - FeesFileURL - XML file of the authorization help content.
    - FeeIDs - Array of IDs of the fee sections in the XML file.
    */
    var OnLoad = function (DescriptionLocationIDs, TitleLocationIDs, FeesFileURL, FeeIDs) {
        var controlContainer = $('#Tabs');
        var controls = controlContainer.find('ul');
        var selectedTab;

        if (DescriptionLocationIDs !== null && TitleLocationIDs !== null && FeesFileURL !== null && FeeIDs !== null) {
            //Ensure that all arrays are the same length.
            if (DescriptionLocationIDs.length === TitleLocationIDs.length && FeeIDs.length === TitleLocationIDs.length) {
                for (var x = 0; x < DescriptionLocationIDs.length; x++) {
                    //alert(DescriptionLocationIDs[x] + " and " + TitleLocationIDs[x] + ".");
                    Get_Fee(DescriptionLocationIDs[x], TitleLocationIDs[x], FeesFileURL, FeeIDs[x]);
                }
            }
        }

        $('div.tab').each(function (i) {
            controls.append('<li><a href="#' + i + '" onclick="Request.Fees.TabClick(' + i + ')">' + $(this).attr('title') + '</a></li>');
        });

        // select initial tab
        selectedTab = 0;
        if (location.hash.length > 0) {
            selectedTab = location.hash.toString().substring(1);
        }
        TabClick(selectedTab);
        controlContainer.show();
        $('.tab').tabs();
    },

    /*
    Sets up the modal help links and checks to see if all necessary form fields are filled in.

    References: jQuery
    Variables:
    - DescriptionLocationID - ID of the field that will hold the fee contents.
    - TitleLocationID - ID of the field that will hold the fee title.
    - FeesFileURL - XML file of the authorization help content.
    - FeeID - ID of the type of Fee being retrieved
    */
    Get_Fee = function (DescriptionLocationID, TitleLocationID, FeesFileURL, FeeID) {
        var $HelpItem;

        if (DescriptionLocationID !== null && TitleLocationID !== null && FeesFileURL !== null && FeeID !== null) {
            $.ajax({
                type: "GET",
                url: FeesFileURL,
                dataType: "xml",
                error: function (jqXHR, textStatus, errorThrown) {
                    alert('Error retrieving Fees content: ' + textStatus + ':' + errorThrown + '.');
                },
                success: function (xml) {
                    $HelpItem = $(xml).find('Help[id=' + FeeID + ']').first();
                    if ($HelpItem !== null) {
                        $(DescriptionLocationID).html($HelpItem.find('Description').text());
                        $(TitleLocationID).html($HelpItem.find('Title').text());
                    }
                }
            });
        }
    },

    /*
    Simulates a tab being selected.

    References: jQuery
    Variables:
    - index - Index number of the tab being selected.
    */
    TabClick = function (index) {
        // update tabs
        $('#Tabs li a').each(function (i) {
            if (i == index) { // cannot use type-specific comparison (i.e. "===") due to handling of URL anchor values
                $(this).addClass('Current');
            }
            else {
                $(this).removeClass('Current');
            }
        });

        // toggle content
        $('div.tab').each(function (i) {
            if (i == index) { // cannot use type-specific comparison (i.e. "===") due to handling of URL anchor values
                $(this).show();
            }
            else {
                $(this).hide();
            }
        });
    };

    //Public interface
    return {
        OnLoad: OnLoad,
        TabClick: TabClick
    };

} ();

//For /Search/Logs
Search.Logs = function () {

    "use strict"

    /*
    Creates tab interface for the logs.

    References: jQuery, Tabs plugin
    Variables:
    N/A
    */
    var OnLoad = function () {
        $('.LinkContent').tabs();
    };

    //Public interface
    return {
        OnLoad: OnLoad
    };

} ();

//For /Search/DepartmentSearch
Search.DepartmentSearch = function () {

    "use strict"

    /*
    Stops recording of scrolling position, so it can be changed manually during paging.
    */
    var OnLoad = function () {
        var manager = Sys.WebForms.PageRequestManager.getInstance();
        //Remove the scrollposition or else the position will be at the bottom after each time the continue, back, or tabs are selected.
        manager._scrollPosition = null;
    };

    //Public Interface
    return {
        OnLoad: OnLoad
    };

} ();

//For /Search/Tips
// Replaced by on-page JavaScript (CHL - 29 APR 2013)
//  - Implements custom Tabs jQuery plugin
//  - Generates TOC by traversing HTML DOM rather than performing HTTP request for XML
Search.Tips = function () {

    "use strict"

    var OnLoad = function () {
        // configure tabbed content
        var contentContainers = $('#uplMainContent .tab').each(function () {
            var name = $(this).find('h2').text();
            $(this).attr('name', name);
            // configure table of contents
            var toc = $(this).find('ul.TOC');
            $(this).find('div.tip').each(function () {
                var text = $(this).find('h3').text();
                var anchor = $(this).find('h3').prev().attr('name');
                toc.append('<li><a href="#' + anchor + '">' + text + '</a></li>');
            });
        });
        contentContainers.tabs({ butons: false, sequential: false });
    };

    //Public Interface
    return {
        OnLoad: OnLoad
    };

} ();

//For /Search/SiteResults
Search.SiteResults = function () {

    "use strict"

    var OnLoad = function () {
        // configure top navigation menu
        $('#cphTopMenu_mnuTopMenu>ul>li>a').each(function () {
            var menuItem = $(this);

            if (menuItem.text() == 'Search') {
                menuItem.addClass('selected');
            }
        });

        // configure breadcrumb
        var breadcrumb = $('#smpBreadcrumbs');
        breadcrumb.find('span:last').remove();
        breadcrumb.find('#smpBreadcrumbs_SkipLink').before('<span><a href="/Search/Search.aspx#">Search</a></span><span class="Divider"> » </span><span>Site Search</span><span class="Divider"> » </span><span>Results</span>');
    };

    //Public Interface
    return {
        OnLoad: OnLoad
    };

} ();

//For /Search/PressRelease
Search.PressRelease = function () {

    "use strict"

    /*
    Loads the content into the press release

    References: jQuery
    Variables:
    - TitleID - ID of the Press Release Title.
    - DateID - ID of the Press Release Date.
    - ContentID - ID for the Press Release Content.
    - ReleaseCollectionID - Release collection parent ID.
    - PRID - Press Release ID.
    - ReleaseFileURL - XML file of the search collections.
    */
    var OnLoad = function (TitleID, DateID, ContentID, ReleaseCollectionID, PRID, ReleaseFileURL) {
        var $PRItem;

        if (TitleID !== null && DateID !== null && ContentID !== null && ReleaseCollectionID !== null && PRID !== null && ReleaseFileURL !== null) {
            $.ajax({
                type: "GET",
                url: ReleaseFileURL,
                dataType: "xml",
                error: function (jqXHR, textStatus, errorThrown) {
                    alert('Error retrieving Press Release content: ' + textStatus + ':' + errorThrown + '.');
                },
                success: function (xml) {
                    $PRItem = $(xml).find("Collection[id=" + ReleaseCollectionID + "]").find('PressRelease[id=' + PRID + ']').first();
                    if ($PRItem !== null) {
                        $(TitleID).html($PRItem.find("Title").text());
                        $(DateID).html($PRItem.find("ReleaseDate").text());
                        $(ContentID).html($PRItem.find("Description").text());
                    }
                }
            });
        }
    };

    //Public Interface
    return {
        OnLoad: OnLoad
    };
} ();

//For /Search/LegacyCollection
Search.Collection = function () {

    "use strict"

    /*
    Retrieves collection data, sub-collections, and its documents.

    References: jQuery
    Variables:
    - CollectionID - ID of the parent collection to retrieve.
    - ChildCollectionID - ID of the child collection to retrieve.
    - TitleID - ID of the HTML element holding the Collection Title.
    - DescriptionID - ID of the HTML element holding the Collection Description.
    - SubOrgID - ID of the HTML element holding the Sub-Collections.
    - DocID - ID of the HTML element holding the related Documents.
    - CollectionFileURL - XML file of the search collections.
    - QueryStringVar - Variable name of the first item in the querystring.
    - QueryStringVar2 - Variable name of the second item in the querystring.
    */
    var OnLoad = function (ParentCollectionID, ChildCollectionID, TitleID, DescriptionID, CollectionSubs, DocID, CollectionFileURL, QueryStringVar, QueryStringVar2) {
        var $ColItem;
        var ColDescription, ParentID, DocSize, ParentTitle;

        if (ParentCollectionID !== undefined && ChildCollectionID !== undefined && TitleID !== undefined && DescriptionID !== undefined && CollectionSubs !== undefined && DocID !== undefined && CollectionFileURL !== undefined && QueryStringVar !== undefined && QueryStringVar2 !== undefined) {
            $.ajax({
                type: "GET",
                url: CollectionFileURL,
                dataType: "xml",
                error: function (jqXHR, textStatus, errorThrown) {
                    alert('Error retrieving Collection content: ' + textStatus + ':' + errorThrown + '.');
                },
                success: function (xml) {
                    if (ChildCollectionID !== "") {
                        ParentID = ChildCollectionID;
                        $ColItem = $(xml).find("Collection[id=" + ParentCollectionID + "]").find('Collection[id=' + ChildCollectionID + ']').first();
                    }
                    else {
                        ParentID = ParentCollectionID;
                        $ColItem = $(xml).find("Collection[id=" + ParentCollectionID + "]").first();
                    }
                    if ($ColItem.length > 0) {
                        ParentTitle = $ColItem.parent().closest("Collection").children("Title").text();
                        if (ParentTitle !== "")
                            ParentTitle += ": ";
                        $(TitleID).html(ParentTitle + $ColItem.children("Title").text());
                        ColDescription = $ColItem.children("Description").text();
                        if (ColDescription !== "")
                            $(DescriptionID).html("<br/>" + $ColItem.children("Description").text());
                        else
                            $(DescriptionID).hide();
                        if ($ColItem.children("Collections").length > 0) {
                            $(CollectionSubs).before("<h4>Collections:</h4>");
                            $ColItem.children("Collections").children("Collection").each(function () {
                                ColDescription = $(this).children("Description").text();
                                if (ColDescription.length > 150)
                                    ColDescription = ColDescription.substring(0, 149) + "...";
                                if (ColDescription.length > 0)
                                    ColDescription = ": " + ColDescription;
                                $(CollectionSubs).append("<li><a href='?" + QueryStringVar + "=" + ParentID + "&" + QueryStringVar2 + "=" + $(this).attr("id") + "'>" + $(this).children("Title").text() + "</a>" + ColDescription + "</li>");
                            });
                        }
                        else
                            $(CollectionSubs).hide();
                        if ($ColItem.children("Documents").length > 0) {
                            $(DocID).before("<h4>Documents:</h4>");
                            $ColItem.children("Documents").children("Document").each(function () {
                                DocSize = $(this).attr("size");
                                if (DocSize === undefined)
                                    DocSize = "";
                                $(DocID).append("<li><a href='" + $(this).attr("url") + "' target='_blank'>" + $(this).attr("title") + "</a>&nbsp;" + DocSize + "</li>");
                            });
                        }
                        else
                            $(DocID).hide();
                    }
                }
            });
        }
    };

    //Public Interface
    return {
        OnLoad: OnLoad
    };
} ();

//For /Contact/Feedback
Contact.Feedback = function () {

    "use strict"

    /*
    Removes the scrollposition to allow javascript scrolling.
    */
    var OnLoad = function () {
        var manager = Sys.WebForms.PageRequestManager.getInstance();
        //Remove the scrollposition or else the position will be at the bottom after each time the continue, back, or tabs are selected.
        manager._scrollPosition = null;
    };

    //Public Interface
    return {
        OnLoad: OnLoad
    };

} ();

//For /_includes/Controls/ctlLinkList
UserControls.LinkList = function () {

    "use strict"

    var ToolTipManager,

    /*
    Retrieves the tooltipmanager from the masterpage.

    References: Telerik Client
    Variables:
    - ToolTipManagerID - ID of the tooltip manager on the master page.
    */
    OnLoad = function (ToolTipManagerID) {
        if (ToolTipManagerID !== undefined)
            ToolTipManager = $find(ToolTipManagerID);
    },

    /*
    Adds a tooltip to a link with tooltip data.

    References: jQuery, Telerik Client
    Variables:
    - CurrentLink - HTML DOM Link.
    - ToolTipText - Tooltip Text.
    */
    ShowToolTip = function (CurrentLink, ToolTipText) {
        var tooltip;

        //Only create a tooltip if the link exists, tooltip is not blank, and the tooltip manager is defined.
        if (CurrentLink !== undefined && ToolTipText !== "" && ToolTipManager !== undefined) {
            try {
                tooltip = ToolTipManager.getToolTipByElement(CurrentLink);
                //Only create a tooltip if there is not one already tied to the current link.
                if (!tooltip) {
                    tooltip = ToolTipManager.createToolTip(CurrentLink);
                    tooltip.set_text(ToolTipText);
                    tooltip.set_position(Telerik.Web.UI.ToolTipPosition.TopRight);
                    tooltip.set_relativeTo(Telerik.Web.UI.ToolTipRelativeDisplay.Element);
                    tooltip.set_animation(Telerik.Web.UI.ToolTipAnimation.Slide);
                    tooltip.set_animationDuration(300);
                    tooltip.set_showDelay(500);
                    tooltip.set_hideDelay(500);
                    tooltip.set_autoCloseDelay(8000);
                    tooltip.set_width("350px");
                }
                //Only show if it is not already visible.
                if (!tooltip.isVisible())
                    tooltip.show();
            }
            catch (exc) {
                alert("Error creating tooltip: " + exc + ".");
            }
        }
        else
            return;
    };

    //Public Interface
    return {
        OnLoad: OnLoad,
        ShowToolTip: ShowToolTip
    };

} ();


FOIAWeb.Test = function () {

    "use strict"

    var OnLoad = function () {
        /*$('.imageWrapper img').mouseover(function () {
        //$(this).next().animate({ opacity: "toggle" }, { duration: 500, queue: false });
        $(this).next().css("visibility", "visible");
        });

        $('.imageWrapper img').mouseout(function () {
        //$(this).next().animate({ opacity: "toggle" }, { duration: 500, queue: false });
        $(this).next().css("visibility", "hidden");
        });*/
        $('#slider').rhinoslider({
            showTime: 5000,
            controlsPrevNext: false,
            controlsPlayPause: false,
            autoPlay: true,
            showCaptions: 'hover',
            showBullets: 'always',
            slideNextDirection: 'toLeft'
        });
    };

    return {
        OnLoad: OnLoad
    };

} ();