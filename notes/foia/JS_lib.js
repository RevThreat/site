/// <reference path="FOIA.js" />
/// <reference path="jquery-1.8.3.js" />
/// <reference path="jquery-1.8.3-vsdoc.js" />


var JS_lib = window.JS_lib || {};

/*
Used to hold global methods related to the user interface (jquery, usually).
*/
JS_lib.User_Interface = function () {

    "use strict"

    /*
    Used to slide DOM elements from left (closed) to right (open).
    References: JQuery
    Variables:
    Identifier - ID of DOM element(s)
    Open - True: slide from left to right;False: Close (right to left).
    MaxWidth - Width to open item up to. Only used with 'Open'.
    */
    var SlideLR = function (Identifier, Open, MaxWidth) {
        if (Identifier != null && Open != null) {
            if (Open && MaxWidth != null) {
                $(Identifier).show().animate({
                    width: "0px", opacity: ".1"
                }, 1).animate({ width: MaxWidth, opacity: "1" }, "slow");
            }
            else {
                $(Identifier).animate({
                    width: "0px", opacity: ".1"
                }, "slow", function () {
                    $(this).hide();
                });
            }
        }
    },

    /*
    Adds outline to textbox/input when focus is on it.
    References: JQuery
    Variables:
    AffectedControls - IDs/classes of controls to modify.
    TextEnteredClass - CSS class to apply when focus is on the textarea/input.
    TextWaitingClass - CSS class to apply when blur is on the textarea/input.
    */
    Text_Focus_Outline = function (AffectedControls, TextEnteredClass, TextWaitingClass) {

        var IsValidItem;

        if (AffectedControls == undefined)
            AffectedControls = 'input, textarea';
        if (TextEnteredClass != undefined && TextWaitingClass != undefined) {
            $(AffectedControls).each(function () {
                IsValidItem = false;
                //Only apply this style to input text or password areas or else it will apply to dropdowns/buttonlists, etc.
                if ($(this).is('input')) {
                    if ($(this).attr('type') == 'text' || $(this).attr('type') == 'password') {
                        IsValidItem = true;
                    }
                }
                else
                    IsValidItem = true;
                if (IsValidItem) {
                    $(this).focus(function () {
                        $(this).addClass(TextEnteredClass).removeClass(TextWaitingClass);
                    });
                    $(this).blur(function () {
                        $(this).removeClass(TextEnteredClass).addClass(TextWaitingClass);
                    });
                }
            });
        }
    },

    /*
    Opens a basic modal box.
    References: JQuery
    Variables:
    MaskID - ID of DOM item that will be the mask behind the modal.
    ModalWindowClass - Class of DOM item representing the modal window.
    CloseClass - Class of DOM item representing the close link.
    ModelMainAreaClass - Class of DOM item representing the main area in the model.
    */
    Open_Basic_Modal = function (MaskID, ModalWindowClass, CloseClass, ModelMainAreaClass) {
        Open_Basic_Modal_w_Data(MaskID, ModalWindowClass, CloseClass, ModelMainAreaClass, null, null, null, null, null, null);
    },

    /*
    Opens a basic modal box and inserts XML content.
    References: JQuery
    Variables:
    MaskID - ID of DOM item that will be the mask behind the modal.
    ModalWindowClass - Class of DOM item representing the modal window.
    CloseClass - Class of DOM item representing the close link.
    ModelMainAreaClass - Class of DOM item representing the main area in the model.
    XML_File - Location of the XML content.
    App_Directory - Folder (if any) where the application resides.
    XMLQuery - XML Query.
    Identifier - ID of the nodeset
    URLAlternate - Alternate URL
    PrintClass - Class of DOM item representing the print link.
    */
    Open_Basic_Modal_w_Data = function (MaskID, ModalWindowClass, CloseClass, ModelMainAreaClass, XML_File, App_Directory, XMLQuery, Identifier, URLAlternate, PrintClass) {
        try {
            if (MaskID != null && ModalWindowClass != null && ModelMainAreaClass != null) {
                if (XMLQuery != null && Identifier != null && URLAlternate != null && XML_File != null && App_Directory != null)
                    Setup_Modal_Content(XMLQuery, ModalWindowClass, ModelMainAreaClass, XML_File, App_Directory, Identifier, URLAlternate);
                else
                    Setup_Modal_Window_Location(ModalWindowClass, ModelMainAreaClass);
                //Set height and width to mask to fill up the whole screen and transition
                $(MaskID).css({ 'width': $(window).width(), 'height': $(document).height() }).fadeIn(500).fadeTo("slow", 0.5);
                //Set the popup window to transition
                if (Identifier != null) {
                    //alert("found? " + $("#" + Identifier.replace(/ /g, '')).html() + ".");
                    $("#" + Identifier.replace(/ /g, '')).fadeIn(1000);
                }
                else
                    $(ModalWindowClass).fadeIn(1000);
                if (CloseClass != null) {
                    //if close button is clicked
                    $(ModalWindowClass + ' ' + CloseClass).die("click").live("click", function (e) {
                        //Cancel the link behavior
                        e.preventDefault();
                        $(MaskID + ', ' + ModalWindowClass).hide();
                    });
                }
                if (PrintClass !== null) {
                    //if print button is clicked
                    $(ModalWindowClass + ' ' + PrintClass).die("click").live("click", function (e) {
                        //Cancel the link behavior
                        e.preventDefault();
                        $(MaskID + ', ' + ModalWindowClass).hide();
                        window.open(App_Directory + AddQuerytoURL(URLAlternate), "_blank");
                    });
                }
                //Delete all previous click events. There can be multiples due to AJAX postbacks, but serverside
                //postbacks will remove ALL events.
                //if mask is clicked
                $(MaskID).die("click").live("click", function () {
                    $(MaskID + ', ' + ModalWindowClass).hide();
                });
                $(ModalWindowClass + ' ' + CloseClass).die("click").live("click", function (e) {
                    //Cancel the link behavior
                    e.preventDefault();
                    $(MaskID + ', ' + ModalWindowClass).hide();
                });
            }
        }
        catch (exc) {
            alert("Error setting up Basic Modal: " + exc + ".");
        }
    },

    /*
    Opens a modal box.
    References: JQuery
    Variables:
    OpenLinkID - DOM item that is clicked to open the modal. ID of Modal will be in the href attribute.
    MaskID - ID of DOM item that will be the mask behind the modal.
    ModalWindowClass - Class of DOM item representing the modal window.
    CloseClass - Class of DOM item representing the close link.
    ModelMainAreaClass - Class of DOM item representing the main area in the model.
    XML_File - Location of the XML content.
    App_Directory - Folder (if any) where the application resides.
    PrintClass - Class of DOM item representing the print link.
    */
    Open_Modal = function (OpenLinkID, MaskID, ModalWindowClass, CloseClass, ModelMainAreaClass, XML_File, App_Directory, PrintClass) {
        var id;

        try {
            if (OpenLinkID !== null && MaskID !== null && ModalWindowClass !== null && CloseClass !== null && ModelMainAreaClass !== null && PrintClass !== null) {
                //select all the a tag with name equal to modal
                //$(OpenLinkID).click(function(e) {
                $(OpenLinkID).die("click").live("click", function (e) {
                    //Cancel the link behavior         
                    e.preventDefault();
                    //Get the A tag
                    id = $(this).attr('href');
                    //Since IE7 is dumb, the entire url (not just the #var) is in the href.
                    id = id.substring(id.lastIndexOf("#"));
                    if (XML_File !== null) {
                        //Setup_Help_Modal_Content('AddtInfo', '.MODALTESTWINDOW', '.MODALTESTMAINAREA');
                        Setup_Help_Modal_Content(id, ModalWindowClass, ModelMainAreaClass, XML_File, App_Directory, PrintClass);
                    }
                    else {
                        //Just using the content that is already within the modal.
                        //Sets the ID of the window, so it can fade in when the link is selected.
                        $(ModalWindowClass).attr("id", id.replace("#", ""));
                        Setup_Modal_Window_Location(ModalWindowClass, ModelMainAreaClass);
                    }
                    if (JS_lib.ByBrowser.IsModern()) {
                        //Set height and width to mask to fill up the whole screen and transition
                        $(MaskID).css({ 'width': $(window).width(), 'height': $(document).height() }).fadeIn(500).fadeTo("slow", 0.5);
                        //Set the popup window to transition
                        $(id).fadeIn(1000);
                    }
                });
                //if close button is clicked
                //$(ModalWindowClass + ' ' + CloseClass).click(function(e) {
                $(ModalWindowClass + ' ' + CloseClass).die("click").live("click", function (e) {
                    //Cancel the link behavior
                    e.preventDefault();
                    $(MaskID + ', ' + ModalWindowClass).hide();
                });

                //if mask is clicked
                //$(MaskID).click(function() {
                $(MaskID).die("click").live("click", function () {
                    $(MaskID + ', ' + ModalWindowClass).hide();
                });
            }
        }
        catch (exc) {
            alert("Error setting up Modal: " + exc + ".");
        }
    },

    /*
    Retrieves and sets modal content.
    References: JQuery
    Variables:
    HelpID - ID of XML Help element.
    ModalWindowClass - Class of DOM item representing the modal window.
    ModalMainContentClass - Class of DOM item representing the main model content area.
    XML_File - Location of the XML content.
    App_Directory - Folder (if any) where the application resides.
    PrintClass - Class of DOM item representing the print link.
    */
    Setup_Help_Modal_Content = function (HelpID, ModalWindowClass, ModalMainContentClass, XML_File, App_Directory, PrintClass) {
        var $ModalTitle, $ModalContent, $HelpItem, $ModalPrint;
        var URL;

        try {
            if (HelpID !== null && ModalWindowClass !== null && ModalMainContentClass !== null && XML_File !== null) {
                HelpID = HelpID.replace("#", "");
                //Set the ID of the modal window, so it will be retrieved when popped up.
                $(ModalWindowClass).attr("id", HelpID);
                //Only return the title area that does not have the close link.         
                $ModalTitle = $(ModalWindowClass + ' span:not(:has(>a))');
                $ModalContent = $(ModalMainContentClass);
                if ($ModalTitle !== null && $ModalContent !== null) {
                    $.ajax({
                        type: "GET",
                        url: XML_File,
                        dataType: "xml",
                        error: function (jqXHR, textStatus, errorThrown) {
                            alert('Error retrieving Help content: ' + textStatus + ':' + errorThrown + '.');
                        },
                        success: function (xml) {
                            $HelpItem = $(xml).find('Help[id=' + HelpID + ']').first();
                            if ($HelpItem !== null) {
                                URL = $HelpItem.find('URL').text();
                                if (JS_lib.ByBrowser.IsModern()) {
                                    $ModalTitle.text("").append($HelpItem.find('Title').text());
                                    $ModalContent.text("").append($HelpItem.find('Description').text());
                                    if (URL !== undefined && App_Directory !== undefined) {
                                        $ModalPrint = $(ModalWindowClass + ' ' + PrintClass);
                                        $ModalPrint.die("click").live("click", function (e) {
                                            //Cancel the link behavior
                                            e.preventDefault();
                                            window.open(App_Directory + AddQuerytoURL(URL), "_blank");
                                        });
                                    }
                                    Setup_Modal_Window_Location(ModalWindowClass, ModalMainContentClass);
                                }
                                else {
                                    if (URL !== undefined && App_Directory !== undefined) {
                                        //alert("pulling up " + App_Directory + URL + ".");
                                        window.open(App_Directory + URL, "_blank");
                                    }
                                }
                            }
                        }
                    });
                }
            }
        }
        catch (exp) {
            alert("Error retrieving/setting modal content: " + exp + ".");
        }
    },

    /*
    Retrieves and sets modal content.
    References: JQuery
    Variables:
    XMLQuery - XML Query.
    ModalWindowClass - Class of DOM item representing the modal window.
    ModalMainContentClass - Class of DOM item representing the main model content area.
    XML_File - Location of the XML content.
    App_Directory - Folder (if any) where the application resides.
    Identifier - ID of the nodeset
    URLAlternate - Alternate URL
    */
    Setup_Modal_Content = function (XMLQuery, ModalWindowClass, ModalMainContentClass, XML_File, App_Directory, Identifier, URLAlternate) {
        var $ModalTitle, $ModalContent, $Item;

        try {
            if (XMLQuery != null && ModalWindowClass != null && ModalMainContentClass != null && XML_File != null && Identifier != null && XMLQuery != null) {
                //Set the ID of the modal window, so it will be retrieved when popped up.
                $(ModalWindowClass).attr("id", Identifier.replace(/ /g, ''));
                //Only return the title area that does not have the close link.         
                $ModalTitle = $(ModalWindowClass + ' span:not(:has(>a))');
                $ModalContent = $(ModalMainContentClass);
                if ($ModalTitle != null && $ModalContent != null) {
                    $.ajax({
                        type: "GET",
                        url: XML_File,
                        dataType: "xml",
                        error: function (jqXHR, textStatus, errorThrown) {
                            alert('Error retrieving content: ' + textStatus + ':' + errorThrown + '.');
                        },
                        success: function (xml) {
                            //Leave double quotes on the inside to allow for spaces within the variable.
                            $Item = $(xml).find(XMLQuery + '"' + Identifier + '"]').first();
                            if ($Item != null) {
                                if (JS_lib.ByBrowser.IsModern()) {
                                    //alert("is modern browser");
                                    $ModalTitle.text("").append($Item.find('Title').text());
                                    $ModalContent.text("").append($Item.find('Description').text());
                                    Setup_Modal_Window_Location(ModalWindowClass, ModalMainContentClass);
                                }
                                else if (URLAlternate != null && App_Directory != null) {
                                    //alert("is antique browser w/" + App_Directory + " and " + URLAlternate + ".");
                                    window.open(App_Directory + URLAlternate, "_blank");
                                }
                            }
                        }
                    });
                }
            }
        }
        catch (exp) {
            alert("Error retrieving/setting modal content: " + exp + ".");
        }
    },

    /*
    Sets the modal to the center of the page (or as best as possible w/ IE < 8.
    References: JQuery
    Variables:
    ModalWindowClass - Class of DOM item representing the modal window.
    ModalMainContentClass - Class of DOM item representing the main model content area.
    */
    Setup_Modal_Window_Location = function (ModalWindowClass, ModalMainContentClass) {
        var $ModalTitle, $ModalContent;
        var heightpadding, widthpadding, halfmodalheight, halfmodalwidth, halfwindowheight, halfwindowwidth;

        try {
            if (ModalWindowClass != null && ModalMainContentClass != null) {
                $ModalTitle = $(ModalWindowClass + ' span:not(:has(>a))');
                $ModalContent = $(ModalMainContentClass);

                heightpadding = new Number($ModalContent.css("margin-top").match("[0-9]*")[0]) + new Number($ModalContent.css("margin-bottom").match("[0-9]*")[0]) + new Number($ModalContent.css("padding-top").match("[0-9]*")[0]) + new Number($ModalContent.css("padding-bottom").match("[0-9]*")[0]) + new Number($ModalTitle.css("margin-top").match("[0-9]*")[0]) + new Number($ModalTitle.css("margin-bottom").match("[0-9]*")[0]) + new Number($ModalTitle.css("padding-top").match("[0-9]*")[0]) + new Number($ModalTitle.css("padding-bottom").match("[0-9]*")[0]);
                widthpadding = new Number($ModalContent.css("margin-left").match("[0-9]*")[0]) + new Number($ModalContent.css("margin-right").match("[0-9]*")[0]) + new Number($ModalContent.css("padding-left").match("[0-9]*")[0]) + new Number($ModalContent.css("padding-right").match("[0-9]*")[0]);

                //IE7 will not appropriately size the item (0), so need to
                //use other measurements.
                if ($ModalContent.width() == 0)
                    $ModalContent.width($(ModalWindowClass).css('max-width'));
                //A bit of a guess, just to get it adjusted higher
                if ($ModalContent.height() == 0) {
                    //Since this is a browser similar to IE 7, then show scrollbars, if needed on the right and padding to not cover the close link.
                    $(ModalWindowClass).css({ 'padding-right': '20px' });
                    $ModalContent.height(($(ModalWindowClass).css('max-height').substring(0, $(ModalWindowClass).css('max-height').length - 2) / 4));
                }
                halfmodalheight = ($ModalContent.height() + $ModalTitle.height() + heightpadding) / 2;
                halfwindowheight = $(window).height() / 2;
                halfmodalwidth = ($ModalContent.width() + widthpadding) / 2;
                halfwindowwidth = $(window).width() / 2;
                //Check to make sure the modal will not be appear above or to the left of the window.
                if (halfwindowheight < halfmodalheight) {
                    halfmodalheight = 0;
                    halfwindowheight = 0;
                }
                if (halfwindowwidth < halfmodalwidth) {
                    halfmodalwidth = 0;
                    halfwindowwidth = 0;
                }
                //Set the popup window to center
                //This has to occur here and not in Open_Modal since the data retrieval will not be resolved by this ajax call by the time it is set within Open_Modal.
                $(ModalWindowClass).css({ 'top': halfwindowheight - halfmodalheight, 'left': halfwindowwidth - halfmodalwidth });
                //alert("window is height:" + $(window).height() + " content height:" + $ModalContent.height() + " title height:" + $ModalTitle.height() + " height padding:" + heightpadding + " window width:" + $(window).width() + " content width:" + $ModalContent.width() + " width padding:" + widthpadding + ".");
            }
        }
        catch (exp) {
            alert("Error setting modal location: " + exp + ".");
        }
    },

    /*
    Adds the print querystring onto the URL. This is used with the print link.

    - URL - URL to append the print value to.
    */
    AddQuerytoURL = function (URL) {
        var forceprint = "print=print";
        var hashvalue;

        if (URL !== undefined) {
            //Get the hash value, then compare to the URL to see if it contains it.
            hashvalue = URL.substring(URL.indexOf("#"));
            //If the url contains a hash and text afterwards, then remove it temporarily.
            //If it does not, then empty the hash value's value before it's appended on at the end.
            if (URL !== hashvalue)
                URL = URL.replace(hashvalue, "");
            else
                hashvalue = "";
            if (URL.indexOf("?") === -1)
                URL += "?" + forceprint;
            else
                URL += "&" + forceprint;
            //Add the hashvalue back in at the end.
            URL += hashvalue;
        }
        return URL;
    },

    /*
    Prints the current page after a pause.
    */
    PrintPage = function (PauseDuration) {
        if (!PauseDuration)
            PauseDuration = 1000;
        setTimeout(function () { window.print(); }, PauseDuration);
    };

    //Public interface
    return {
        SlideLR: SlideLR,
        Open_Modal: Open_Modal,
        Open_Basic_Modal_w_Data: Open_Basic_Modal_w_Data,
        Open_Basic_Modal: Open_Basic_Modal,
        Text_Focus_Outline: Text_Focus_Outline,
        PrintPage: PrintPage
    };
} ();

/*
Adds masking to textboxes.
*/
JS_lib.User_Interface.Masking = function () {

    "use strict"

    /* Public Properties */
    var TextBoxEnteredClass = "", //This should be assigned within the FOIA JS, but this code should reside in its own class.
    TextBoxWaitingClass = "", //This should be assigned within the FOIA JS, but this code should reside in its own class.

    /*
    Mask for just the month and year. Should not change.
    */
    MONTHYEAR_MASK = function () {
        return "mm/yyyy";
    },

    /*
    Mask for currency without the dollar sign. Should not change.
    */
    DOLLARCURRNOSIGN_MASK = function () {
        return "0.00";
    },

    /*
    Mask for currency without the email address. Should not change.
    */
    EMAIL_MASK = function () {
        return "you@domain.com";
    },

    /*
    Mask for zip code. Should not change.
    */
    ZIP_MASK = function () {
        return "XXXXX";
    },

    /*
    Mask for phone. Should not change.
    */
    PHONE_MASK = function () {
        return "(xxx) xxx-xxxx";
    },

    /*
    Adds masking to a textbox/input.
    References: JQuery
    Variables:
    Textbox Identifier - ID of Textbox DOM element(s)
    Mask - Mask to apply to the textbox. Can be text or the items listed below.
    TextEnteredClass - CSS class to apply when focus is on the textarea/input.
    TextWaitingClass - CSS class to apply when blur/no focus is related to the textarea/input.
    */
    Add_TextBox_Masking = function (TextBoxIDName, TextMask, TextEnteredClass, TextWaitingClass) {
        //    var TextMask = "Enter Search Words";
        var TextBoxID = $(TextBoxIDName);

        if (TextBoxID != null && TextMask != null && TextEnteredClass != null && TextWaitingClass != null) {
            try {
                TextBoxID
        	    .removeClass(TextEnteredClass)
        	    .addClass(TextWaitingClass);
                //Only modify the value initially if the textbox is empty. This is done due to 
                //this potentially being called on every postback within an updatepanel.
                if (TextBoxID.val() == "") {
                    TextBoxID.val(TextMask);
                }

                TextBoxID.blur(function () {
                    if (TextBoxID.val() == "") {
                        TextBoxID
                	.removeClass(TextEnteredClass)
                	.addClass(TextWaitingClass)
                	.val(TextMask);
                    }
                });

                TextBoxID.focus(function () {
                    if (TextBoxID.val() == TextMask) {
                        TextBoxID
                	.removeClass(TextWaitingClass)
                	.addClass(TextEnteredClass)
                	.val("");
                    }
                });
            }
            catch (exp) {
                alert("Error setting textbox masking: " + exp);
            }
        }
    },

    /*
    Assists with enabling/disabling validators refering to textboxes with masking applied.
    References: JQuery
    Variables:
    Textbox Identifier - ID of Textbox DOM element
    Validator Identifier - ID of Validator DOM element. DO NOT INCLUDE # since obtaining DOM element.
    Mask - Mask to apply to the textbox. Can be text or the items listed below.
    */
    Validate_Masking = function (TextBoxIDName, ValidatorIDName, TextMask) {
        try {
            var TextBox = $(TextBoxIDName);
            var TBValidator = document.getElementById(ValidatorIDName); //Need to get the actual DOM object to use ValidatorEnable

            if (TextBox != null && TBValidator != null) {
                if (TextBox.val() == TextMask) {
                    //alert('tb ' + TextBox.val() + ' mask ' + TextMask + ' disabling ' + ValidatorIDName + '.');
                    ValidatorEnable(TBValidator, false);
                }
                else
                    ValidatorEnable(TBValidator, true);
            }
        }
        catch (exp) {
            alert("Error validating textbox masking: " + exp);
        }
    },

    /*
    Assists with enabling/disabling validators refering to textboxes with masking applied. This applies to validators
    like compare validators.
    References: JQuery
    Variables:
    Textbox Identifier - ID of one Textbox DOM element
    Textbox Identifier - ID of the other Textbox DOM element.
    Validator Identifier - ID of Validator DOM element. DO NOT INCLUDE # since obtaining DOM element.
    Mask - Mask to apply to the textbox. Can be text or the items listed below.
    */
    Validate_Masking2 = function (TextBoxIDName1, TextBoxIDName2, ValidatorIDName, TextMask) {
        try {
            var TextBox1 = $(TextBoxIDName1);
            var TextBox2 = $(TextBoxIDName2);
            var TBValidator = document.getElementById(ValidatorIDName); //Need to get the actual DOM object to use ValidatorEnable

            if (TextBox1 != null && TextBox2 != null && TBValidator != null) {
                //Both of the textboxes need to be set to their mask default or else the validator should run.
                if (TextBox1.val() == TextMask && TextBox2.val() == TextMask)
                    ValidatorEnable(TBValidator, false);
                else
                    ValidatorEnable(TBValidator, true);
            }
        }
        catch (exp) {
            alert("Error validating both textboxes with masking: " + exp);
        }
    };

    //Public interface
    return {
        TextBoxEnteredClass: TextBoxEnteredClass,
        TextBoxWaitingClass: TextBoxWaitingClass,
        MONTHYEAR_MASK: MONTHYEAR_MASK,
        DOLLARCURRNOSIGN_MASK: DOLLARCURRNOSIGN_MASK,
        EMAIL_MASK: EMAIL_MASK,
        ZIP_MASK: ZIP_MASK,
        PHONE_MASK: PHONE_MASK,
        Add_TextBox_Masking: Add_TextBox_Masking,
        Validate_Masking: Validate_Masking,
        Validate_Masking2: Validate_Masking2
    };
} ();

/*
Validates input.
*/
JS_lib.User_Interface.Validate_Input = function () {

    //"use strict"

    /*
    Validates whether an item in the checkboxlist is filled in.
    References: JQuery & .net
    Variables:
    listid - ID/class of checkboxlist.
    arguments - Passed in from .net ValidateListSelected.
    */
    var ValidateCheckBoxList = function (listid, arguments) {
        //    var listid = '#<%= cblExpHandling.ClientID %>';
        //    var $List = $(listid + ' input[checked=checked]');
        if (listid != null && arguments != null) {
            if ($(listid + ' ' + JS_lib.ByBrowser.GetCheckboxSelectedIDbyBrowser()).length > 0)
                arguments.IsValid = true;
            else {
                $(listid).focus();
                arguments.IsValid = false;
            }
        }
        else
            arguments.IsValid = false;
    },

    /*
    Validates whether the selected item in the dropdown is not blank.
    References: .net
    Variables:
    source - custom validator object.
    arguments - contains whether is valid and value of item validating.
    */
    ValidateDropdown = function (source, arguments) {
        if (source !== null && arguments !== null) {
            //alert("validating dd value:" + arguments.Value + ".with " + arguments + ".");
            if (arguments.Value !== '')
                arguments.IsValid = true;
            else
                arguments.IsValid = false;
        }
        else
            arguments.IsValid = false;
    },

    /*
    Validates whether the selected item in the dropdown is not choosing the generic, "select" option.
    References: .net
    Variables:
    source - custom validator object.
    arguments - contains whether is valid and value of item validating.
    */
    ValidateDropdownGeneric = function (source, arguments) {
        if (source !== null && arguments !== null) {
            //alert("validating dd value:" + arguments.Value + ".with " + arguments + ".");
            //Ensure that the value does not start with "select "
            if (arguments.Value.toLowerCase().indexOf("select ") !== 0)
                arguments.IsValid = true;
            else
                arguments.IsValid = false;
        }
        else
            arguments.IsValid = false;
    },

    /*
    Ensures that the date value in the comparisonID (jquery UI datepicker) is within the max/min range and greater/less than the comparison date (jquery UI datepicker).

    References: jQuery, jQuery UI
    Variables:
    - CompareID - Form item being validated.
    - enteredDate - Value of the form item being validated.
    - MaximumDate - Maximum date.
    - MinimumDate - Minimum date.
    - CompareToID - Form item comparing to.
    - IsGreater - true=Error if CompareID>CompareToID.false=Error if CompareID<CompareToID
    - divCompareDateErrorID - ID of the container that will display the date error.
    */
    ValidateDateRange = function (CompareID, enteredDate, MaximumDate, MinimumDate, CompareToID, IsGreater, divCompareDateErrorID) {
        var CompareValue, selectedDateFormatted;

        if (CompareID !== null && enteredDate !== null && CompareToID !== null && IsGreater !== null && divCompareDateErrorID !== null) {
            selectedDate = new Date(enteredDate);
            CompareValue = $(CompareToID).datepicker("getDate");
            selectedDateFormatted = isValidDate(selectedDate);

            //Clear out any previous error message.
            if (divCompareDateErrorID !== null)
                $(divCompareDateErrorID).text("");
            //If an invalid date is entered, then clear the field, else return it in the correct format (mm/dd/yyyy).
            if (enteredDate !== "") {
                if (!selectedDateFormatted || enteredDate !== selectedDateFormatted) {
                    $(divCompareDateErrorID).text("Invalid Date");
                    $(CompareID).datepicker("setDate", "");
                }
                //If there was a formatting issue, then fix the current item.
                /*else if (enteredDate !== selectedDateFormatted)
                $(CompareID).datepicker("setDate", selectedDateFormatted);*/
            }
            //Only fix to max or min date if the max and min are enterd and the format is valid.
            if ((MaximumDate !== null || MinimumDate !== null) && enteredDate === selectedDateFormatted) {
                //If an invalid date is entered, then set the date to the maximum or minimum.
                /*if (!selectedDateFormatted) {
                //Likely comparing the bottom range value.
                if (IsGreater && MinimumDate !== null)
                $(CompareID).datepicker("setDate", MinimumDate);
                //Likely comparing the top range value.
                else if (MaximumDate !== null)
                $(CompareID).datepicker("setDate", MaximumDate);
                }*/
                //If the date is greater than the max, then set to the max.
                if (MaximumDate !== null) {
                    if (selectedDate > MaximumDate) {
                        $(divCompareDateErrorID).text("Date must be before " + getDateinFormat(MaximumDate, 24));
                        $(CompareID).datepicker("setDate", "");
                        //$(CompareID).datepicker("setDate", MaximumDate);
                    }
                }
                //If the date is less than the minimum, then set to the min.
                else if (MinimumDate !== null) {
                    if (selectedDate < MinimumDate) {
                        $(divCompareDateErrorID).text("Date must be after " + getDateinFormat(MinimumDate, -24));
                        $(CompareID).datepicker("setDate", "");
                        //$(CompareID).datepicker("setDate", MinimumDate);
                    }
                }
            }
            //If comparing to another datepicker, then ensure that the date is within the appropriate range.
            if (CompareValue !== null) {
                //Fix the date if it is greater than the compare value.
                if (IsGreater) {
                    if (selectedDate > CompareValue) {
                        $(divCompareDateErrorID).text("Date must be before " + getDateinFormat(CompareValue, 24));
                        $(CompareID).datepicker("setDate", "");
                        //$(CompareID).datepicker("setDate", CompareValue);
                    }
                }
                //Fix the date if it is less than the compare value.
                else {
                    if (selectedDate < CompareValue) {
                        $(divCompareDateErrorID).text("Date must be after " + getDateinFormat(CompareValue, -24));
                        $(CompareID).datepicker("setDate", "");
                        //$(CompareID).datepicker("setDate", CompareValue);
                    }
                }
            }
        }
    },

    /*
    Returns the date in the following format: mm/dd/yyyy.

    Variables:
    - d - Date.
    - OriginalDate - Starting Date.
    - Modification - Number of hours to modify the date by.
    */
    getDateinFormat = function (OriginalDate, Modification) {
        var d;

        if (OriginalDate !== undefined) {
            d = new Date(OriginalDate);
            if (Modification !== undefined)
                d.setHours(Modification);
            return (d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear();
        }
        else
            return "";
    },

    /*
    Returns the datetime value if the object is a date.

    References:jQuery, jQuery UI
    Variables:
    - d - Date object.
    */
    isValidDate = function (d) {
        //Not a datetime
        if (Object.prototype.toString.call(d) !== "[object Date]")
            return false;
        //Not a number
        else if (isNaN(d.getTime()))
            return false;
        //Not formatted correctly(mm/dd/yyyy)
        else if (!$.datepicker.formatDate('mm/dd/yy', d).match(/^\d{1,2}\/\d{1,2}\/\d{4}$/))
            return false;
        return $.datepicker.formatDate('mm/dd/yy', d);
    };

    //Public interface
    return {
        ValidateCheckBoxList: ValidateCheckBoxList,
        ValidateDropdown: ValidateDropdown,
        ValidateDropdownGeneric: ValidateDropdownGeneric,
        ValidateDateRange: ValidateDateRange,
        isValidDate: isValidDate,
        getDateinFormat: getDateinFormat
    };
} ();

/*
Provides generic formtting capabilities.
*/
JS_lib.Formatting = function () {

    "use strict"

    /*
    Adds commas to a number that is passed in.
    References: None
    Variables:
    - val - Adds commas to this number. 
    */
    var commaSeparateNumber = function (val) {
        while (/(\d+)(\d{3})/.test(val.toString())) {
            val = val.toString().replace(/(\d+)(\d{3})/, '$1' + ',' + '$2');
        }
        return val;
    };

    //public interface
    return {
        commaSeparateNumber: commaSeparateNumber
    };
} ();

/*
Miscellaneous utiliies.
*/
JS_lib.ByBrowser = function () {

    "use strict"

    /*
    Retrieves version number of IE or 0 for other browsers. Minor Version info is ignored.
    References: None
    Variables:
    N/A
    */
    var msieversion = function () {
        var ua = window.navigator.userAgent
        var msie = ua.indexOf("MSIE ")

        if (msie > 0)      // If Internet Explorer, return version number
            return parseInt(ua.substring(msie + 5, ua.indexOf(".", msie)));
        else                 // If another browser, return 0
            return 0;
    },

    /*
    Returns whether the current browser is better than IE7
    */
    IsModern = function () {
        var IEVersion = msieversion();

        if ((IEVersion == 0 || IEVersion > 7))
            return true;
        else
            return false;
    },

    /*
    Returns count of items checked by browser type.
    References: JQuery
    Variables:
    Identifiers - Item identifiers.
    */
    GetCheckboxItemCountbyBrowser = function (Identifiers) {
        if (Identifiers != undefined)
            return $(Identifiers + " " + JS_lib.ByBrowser.GetCheckboxSelectedIDbyBrowser()).length;
        else
            return 0;
    },

    /*
    Returns Identifier for choosing input items that are checked.
    References: None.
    Variables:
    N/A
    */
    GetCheckboxSelectedIDbyBrowser = function () {
        var IEVersion = msieversion();

        //checked=checked for modern browsers, checked=true for IE7
        if ((IEVersion == 0 || IEVersion > 6))
            return "input[checked=checked]";
        else
            return "input[checked=true]";
    };

    //Public interface
    return {
        msieversion: msieversion,
        IsModern: IsModern,
        GetCheckboxItemCountbyBrowser: GetCheckboxItemCountbyBrowser,
        GetCheckboxSelectedIDbyBrowser: GetCheckboxSelectedIDbyBrowser
    };
} ();

/*
Enumerations.

Object.freeze could be used to prevent changes, but this only works with IE8+ and alternate browsers.
*/
JS_lib.Enumerations = function () {

    "use strict"

    /*
    Use for left/right directions.
    */
    var LR = {
        LEFT: { value: "left", htmlmod: "-", htmlmodopp: "+" },
        RIGHT: { value: "right", htmlmod: "+", htmlmodopp: "-" }
    };

    //Public interface
    return {
        LR: LR
    };
} ();