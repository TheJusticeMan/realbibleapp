let SubmenuWindow = null;

function setUpSettings() {
    document.getElementById("submunucont").innerHTML = "";
    document.getElementById("settings-list").innerHTML = "";
    SubmenuWindow = createElement("div", { className: "submenu-window", id: "submenu" });
    document.getElementById("submunucont").appendChild(SubmenuWindow);
    Object.entries(defaultSettings).forEach(([setting, settingObj]) => {
        Settings[setting] ??= settingObj.defaultValue;

        Object.assign(settingObj, {
            containerId: "settings-list",
            settingKey: setting
        });

        new settingObj.type({
            ...settingObj
        });
    });
    fontSize = Settings.fontSize;
    const body = document.body;

    // Apply theme and font size
    body.className = Settings["invert-inputs"] ? "inverted-input-theme" : "main-theme";
    body.style.cssText = `
        --Foreground: ${Settings.Foreground};
        --Background: ${Settings.Background};
        --Accent1: ${Settings.Accent1};
        --Accent2: ${Settings.Accent2};
        --FontSize: ${Settings.fontSize}px;
        --Font: ${Settings.Font};
    `;

    // Toggle enhance-spacing class
    body.classList.toggle("enhance-spacing", Settings.EnhanceSpacing);

    // Remove previous font classes and apply new font
    defaultSettings.Font.options.forEach(option => body.classList.remove(option.value));
    body.classList.add(Settings.Font);

    // Toggle fullscreenDiv visibility
    document.getElementById("fullscreenDiv").style.display = Settings.flipPages ? "flex" : "none";
}

function mergeSettings(DefaultSettings, Settings) {
    const mergedSettings = {};
    for (const setting in DefaultSettings) {
        if (Settings.hasOwnProperty(setting) && Settings[setting] !== undefined && Settings[setting] !== null) {
            mergedSettings[setting] = Settings[setting];
        } else {
            mergedSettings[setting] = DefaultSettings[setting];
        }
    }
    return mergedSettings;
}

function createElement(type, attributes = {}, children = []) {
    const element = Object.assign(document.createElement(type), attributes);
    children.forEach(child => element.appendChild(
        typeof child === "string" ? document.createTextNode(child) : child
    ));
    return element;
}

class ToggleSetting {
    constructor({ containerId, label, settingKey, defaultValue = false, onChange }) {
        this.containerId = containerId;
        this.label = label;
        this.settingKey = settingKey;
        this.defaultValue = defaultValue;
        this.onChange = onChange;
        this.init();
    }

    init() {
        const container = document.getElementById(this.containerId);
        if (!container) return console.error(`Container with ID '${this.containerId}' not found.`);

        const toggleInput = createElement("input", {
            type: "checkbox",
            className: "toggle-input",
            id: `toggle-${this.settingKey}`,
            checked: this.getSettingValue()
        });

        const settingRow = createElement("div", { className: "setting-row" }, [
            createElement("label", { className: "setting-label", htmlFor: `toggle-${this.settingKey}` }, [this.label]),
            createElement("div", { className: "toggle-wrapper" }, [
                toggleInput,
                createElement("span", { className: "toggle-slider" })
            ])
        ]);

        container.appendChild(settingRow);

        const handleChange = () => {
            this.saveSetting(toggleInput.checked);
            this.onChange?.(toggleInput.checked);
        };

        toggleInput.addEventListener("change", handleChange);
        settingRow.querySelector(".toggle-slider").addEventListener("click", () => {
            toggleInput.checked = !toggleInput.checked;
            handleChange();
        });
    }

    saveSetting(value) {
        localStorage.setItem(this.settingKey, value);
        Settings[this.settingKey] = value;
        saveHistoryAndBookmarks();
    }

    getSettingValue() {
        return this.settingKey in Settings
            ? Settings[this.settingKey]
            : localStorage.getItem(this.settingKey) === "true" || this.defaultValue;
    }
}

class PickSetting {
    constructor({ containerId, label, settingKey, options = [], defaultValue = '', onChange }) {
        this.containerId = containerId;
        this.label = label;
        this.settingKey = settingKey;
        this.options = options;
        this.defaultValue = defaultValue;
        this.onChange = onChange;
        this.init();
    }

    init() {
        const container = document.getElementById(this.containerId);
        if (!container) return console.error(`Container with ID '${this.containerId}' not found.`);

        const currentValue = this.getSettingValue();
        const currentOption = this.options.find(o => o.value === currentValue) || this.options[0];

        const labelEl = createElement("label", {
            className: "setting-label",
            for: `pick-${this.settingKey}`
        }, [`${this.label}: ${currentOption.label}`]);

        const selectEl = createElement("select", {
            className: "pick-select",
            id: `pick-${this.settingKey}`
        }, this.options.map(o =>
            createElement("option", {
                value: o.value,
                selected: o.value === currentValue
            }, [o.label])
        ));

        const settingRow = createElement("div", { className: "setting-row" }, [labelEl, selectEl]);
        container.appendChild(settingRow);

        settingRow.addEventListener("click", () => {
            selectEl.focus();
            selectEl.click();
        });

        selectEl.addEventListener("change", () => {
            const selectedOption = this.options.find(o => o.value === selectEl.value);
            labelEl.textContent = `${this.label}: ${selectedOption.label}`;
            this.saveSetting(selectEl.value);
            this.onChange?.(selectEl.value);
        });
    }

    saveSetting(value) {
        localStorage.setItem(this.settingKey, value);
        Settings[this.settingKey] = value;
        saveHistoryAndBookmarks();
    }

    getSettingValue() {
        return this.settingKey in Settings
            ? Settings[this.settingKey]
            : localStorage.getItem(this.settingKey) || this.defaultValue;
    }
}

class SliderSetting {
    constructor({ containerId, label, settingKey, min = 0, max = 100, defaultValue = 50, onChange }) {
        this.containerId = containerId;
        this.label = label;
        this.settingKey = settingKey;
        this.min = min;
        this.max = max;
        this.defaultValue = defaultValue;
        this.onChange = onChange;
        this.init();
    }

    init() {
        const container = document.getElementById(this.containerId);
        if (!container) return console.error(`Container with ID '${this.containerId}' not found.`);

        const currentValue = this.getSettingValue();

        const labelEl = createElement("label", {
            className: "setting-label",
            for: `slider-${this.settingKey}`,
            style: this.label === "Font Size" ? `font-size: ${currentValue}px;` : ""
        }, [`${this.label}: ${currentValue}`]);

        const slider = createElement("input", {
            type: "range",
            className: "slider-input",
            id: `slider-${this.settingKey}`,
            min: this.min,
            max: this.max,
            value: currentValue
        });

        const settingRow = createElement("div", { className: "setting-row" }, [labelEl, slider]);
        container.appendChild(settingRow);

        slider.addEventListener("input", () => {
            labelEl.textContent = `${this.label}: ${slider.value}`;
            if (this.label === "Font Size") labelEl.style.fontSize = `${slider.value}px`;
            this.saveSetting(slider.value);
            this.onChange?.(slider.value);
        });
    }

    saveSetting(value) {
        localStorage.setItem(this.settingKey, value);
        Settings[this.settingKey] = value;
        saveHistoryAndBookmarks();
    }

    getSettingValue() {
        return this.settingKey in Settings
            ? Settings[this.settingKey]
            : localStorage.getItem(this.settingKey) || this.defaultValue;
    }
}

class ColorPickerSetting {
    constructor({ containerId, label, settingKey, defaultValue = "#FFFFFF", onChange }) {
        this.containerId = containerId;
        this.label = label;
        this.settingKey = settingKey;
        this.defaultValue = defaultValue;
        this.onChange = onChange;
        this.init();
    }

    init() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`Container with ID '${this.containerId}' not found.`);
            return;
        }

        const colorPickerContainer = createElement("div", {
            className: "color-picker-container",
            value: this.getSettingValue()
        });

        const labelEl = createElement("label", {
            className: "setting-label",
            textContent: this.label,
            htmlFor: `color-picker-${this.settingKey}`
        });

        const colorInput = createElement("input", {
            type: "button",
            className: "color-picker-input",
            id: `color-picker-${this.settingKey}`,
            value: this.getSettingValue()
        });
        colorInput.style.backgroundColor = this.getSettingValue();

        const settingRow = createElement("div", { className: "setting-row" }, [
            colorPickerContainer,
            labelEl,
            colorInput
        ]);

        container.appendChild(settingRow);

        colorInput.addEventListener("click", () => {
            const colorPicker = new ColorPicker(colorPickerContainer);
            colorPicker.onColorSelect = (color) => {
                colorInput.value = color;
                colorInput.style.backgroundColor = color;
                colorPickerContainer.value = color;
                this.saveSetting(color);
                this.onChange?.(color);
            };
            this.saveSetting(colorInput.value);
            this.onChange?.(colorInput.value);
        });
    }

    saveSetting(value) {
        localStorage.setItem(this.settingKey, value);
        Settings[this.settingKey] = value;
        saveHistoryAndBookmarks();
    }

    getSettingValue() {
        return Settings[this.settingKey] || localStorage.getItem(this.settingKey) || this.defaultValue;
    }
}

class BackButton {
    constructor({ containerId, label, onClick }) {
        this.init(containerId, label, onClick);
    }

    init(containerId, label, onClick) {
        const container = document.getElementById(containerId);
        if (!container) return console.error(`Container with ID '${containerId}' not found.`);

        const backButton = createElement("div", {
            className: "setting-label",
            textContent: label,
            onclick: onClick
        });

        container.appendChild(createElement("div", { className: "setting-row" }, [backButton]));
    }
}

class SettingsSubmenu {
    constructor({ containerId, label, settingKey, options = {} }) {
        this.init(containerId, label, settingKey, options);
    }

    init(containerId, label, settingKey, options) {
        const container = document.getElementById(containerId);
        if (!container) return console.error(`Container with ID '${containerId}' not found.`);

        const labelEl = createElement("label", {
            className: "setting-label",
            textContent: label,
            for: `submenu-${settingKey}`,
            onclick: () => this.openSubmenu(options)
        });

        container.appendChild(createElement("div", { className: "setting-row" }, [labelEl]));
    }

    openSubmenu(options) {
        new BackButton({
            containerId: "submenu",
            label: "Back",
            onClick: () => {
                SubmenuWindow.style.display = "none";
                SubmenuWindow.innerHTML = "";
            }
        });

        Object.entries(options).forEach(([setting, settingObj]) => {
            Settings[setting] ??= settingObj.defaultValue;
            Object.assign(settingObj, {
                containerId: "submenu",
                settingKey: setting
            });

            new settingObj.type({ ...settingObj });
        });

        SubmenuWindow.style.display = "block";
    }
}

class ColorPicker {
    constructor(containerElement) {
        this.container = containerElement;
        this.container.className = "color-picker-container";
        this.container.style.display = 'flex';

        this.onColorSelect = (color) => {
            console.log(`Color selected: ${color}`);
        };

        this.palettes = {
            hue: this.createElement('div', { id: 'hue-palette' }),
            saturation: this.createElement('div', { id: 'saturation-palette' }),
            lightness: this.createElement('div', { id: 'lightness-palette' }),
        };

        this.colorPreview = this.createElement('div', { id: 'color-preview', className: 'color-preview' });
        this.colorCode = this.createElement('div', { id: 'color-code', className: 'color-code' });

        this.colorPreview.addEventListener('click', () => {
            const color = `hsl(${this.selectedHue.toFixed(1)}, ${this.selectedSaturation}%, ${this.selectedLightness}%)`;
            this.colorPreview.style.backgroundColor = color;
            this.colorCode.textContent = color;
            this.onColorSelect(color);
            this.destroy();
        });

        const initialColor = this.parseHSL(this.container.value || 'hsl(0, 100%, 50%)');
        this.selectedHue = initialColor.hue;
        this.selectedSaturation = initialColor.saturation;
        this.selectedLightness = initialColor.lightness;

        this.factor = (3 - Math.sqrt(5)) * 180;

        this.update();
    }

    parseHSL(hslString) {
        const match = hslString.match(/hsl\((\d+(\.\d+)?),\s*(\d+(\.\d+)?)%,\s*(\d+(\.\d+)?)%\)/);
        if (!match) {
            console.error('Invalid HSL string format');
            return { hue: 0, saturation: 100, lightness: 50 };
        }
        return {
            hue: parseFloat(match[1]),
            saturation: parseFloat(match[3]),
            lightness: parseFloat(match[5]),
        };
    }

    createElement(type, attributes = {}, children = []) {
        const element = Object.assign(document.createElement(type), attributes);
        children.forEach(child => element.appendChild(
            typeof child === "string" ? document.createTextNode(child) : child
        ));
        this.container.appendChild(element);
        return element;
    }

    createPalette(palette, values, type) {
        palette.innerHTML = '';
        palette.className = 'color-palette';

        values.forEach(value => {
            const colorBox = this.createElement('div', {
                className: 'color-box'
            });

            colorBox.style.backgroundColor = type === 'hue'
                ? `hsl(${(value * this.factor) % 360}, ${this.selectedSaturation}%, ${this.selectedLightness}%)`
                : type === 'saturation'
                    ? `hsl(${this.selectedHue}, ${value}%, ${this.selectedLightness}%)`
                    : `hsl(${this.selectedHue}, ${this.selectedSaturation}%, ${value}%)`;
            colorBox.dataset.value = type === 'hue' ? (value * this.factor) % 360 : value;


            colorBox.addEventListener('click', () => {
                if (type === 'hue') this.selectedHue = parseFloat(colorBox.dataset.value);
                if (type === 'saturation') this.selectedSaturation = parseFloat(colorBox.dataset.value);
                if (type === 'lightness') this.selectedLightness = parseFloat(colorBox.dataset.value);

                this.update();
                this.container.value = `hsl(${this.selectedHue.toFixed(1)}, ${this.selectedSaturation}%, ${this.selectedLightness}%)`;
            });

            palette.appendChild(colorBox);
        });
    }

    updateColorPreview() {
        const color = `hsl(${this.selectedHue.toFixed(1)}, ${this.selectedSaturation}%, ${this.selectedLightness}%)`;
        this.colorPreview.style.backgroundColor = color;
        this.colorCode.textContent = color;
    }

    updatePalettes() {
        this.createPalette(this.palettes.hue, Array.from({ length: 11 }, (_, i) => i), 'hue');
        this.createPalette(this.palettes.saturation, Array.from({ length: 11 }, (_, i) => i * 10), 'saturation');
        this.createPalette(this.palettes.lightness, Array.from({ length: 11 }, (_, i) => i * 10), 'lightness');
    }

    update() {
        this.updateColorPreview();
        this.updatePalettes();
    }

    destroy() {
        this.container.innerHTML = '';
        this.container.style.display = 'none';
    }
}


let defaultSettings = {
    "colors": {
        type: SettingsSubmenu,
        label: "Colors",
        settingKey: "colors",
        options: {
            "invert-inputs": {
                type: ToggleSetting,
                label: "Invert Inputs",
                defaultValue: true,
                onChange: (value) => {
                    document.body.classList.remove(value ? "main-theme" : "inverted-input-theme");
                    document.body.classList.add(value ? "inverted-input-theme" : "main-theme");
                    console.log(`Invert Inputs is now ${value ? "enabled" : "disabled"}`);
                }
            },
            "Foreground": {
                type: ColorPickerSetting,
                label: "Foreground Color",
                defaultValue: "hsl(0,100%,100%)",
                onChange: (value) => {
                    document.body.style.setProperty("--Foreground", value);
                    document.body.style.color = value;
                    console.log(`Foreground Color changed to ${value}`);
                }
            },
            "Background": {
                type: ColorPickerSetting,
                label: "Background Color",
                defaultValue: "hsl(0,100%,0%)",
                onChange: (value) => {
                    document.body.style.setProperty("--Background", value);
                    document.body.style.backgroundColor = value;
                    console.log(`Background Color changed to ${value}`);
                }
            },
            "Accent1": {
                type: ColorPickerSetting,
                label: "Accent Color 1",
                defaultValue: "hsl(275,100%,50%)",
                onChange: (value) => {
                    document.body.style.setProperty("--Accent1", value);
                    console.log(`Accent Color 1 changed to ${value}`);
                }
            },
            "Accent2": {
                type: ColorPickerSetting,
                label: "Accent Color 2",
                defaultValue: "hsl(105,100%,50%)",
                onChange: (value) => {
                    document.body.style.setProperty("--Accent2", value);
                    console.log(`Accent Color 2 changed to ${value}`);
                }
            }
        }
    },
    "fontSize": {
        type: SliderSetting,
        label: "Font Size",
        defaultValue: 16,
        min: 4,
        max: 64,
        step: 1,
        onChange: (value) => {
            document.body.style.setProperty("--FontSize", value + "px");
            fontSize = value;
        }
    },
    "Font": {
        type: PickSetting,
        label: "Font",
        defaultValue: "Fontserif",
        options: [
            { value: "Fontserif", label: "Serif" },
            { value: "Fontsansserif", label: "Sans" },
            { value: "Merriweather", label: "Merriweather" },
            { value: "NotoSans", label: "Noto Sans" },
            { value: "LexendDeca", label: "Lexend Deca" },
            { value: "PTSerif", label: "PT Serif" }],
        onChange: (value) => {
            // Add the class for the font
            defaultSettings.Font.options.map((option) => {
                document.body.classList.remove(option.value);
            });
            document.body.classList.add(value);
            document.body.style.setProperty("--Font", value);
            console.log(`Font changed to ${value}`);
        }
    },
    "EnhanceSpacing": {
        type: ToggleSetting,
        label: "Add extra spacing around words",
        defaultValue: true,
        onChange: (value) => {
            if (value) {
                document.body.classList.add("enhance-spacing");
            } else {
                document.body.classList.remove("enhance-spacing");
            }
            console.log(`There will now be ${value ? "more" : "less"} spacing around words`);
        }
    },
    "debug": {
        type: ToggleSetting,
        label: "Debug Mode",
        defaultValue: false,
        onChange: (value) => {
            console.log(`Debug Mode is now ${value ? "enabled" : "disabled"}`);
        }
    },
    "flipPages": {
        type: ToggleSetting,
        label: "Break the app",/* Flip through the Bible */
        defaultValue: false,
        onChange: (value) => {
            document.getElementById("fullscreenDiv").style.display = value ? "flex" : "none";
            console.log(`AI descriptions will ${value ? "load" : "not load"} next time.`);
        }
    },
    "includeAI": {
        type: ToggleSetting,
        label: "Load AI topic bot",
        defaultValue: false,
        onChange: (value) => {
            console.log(`AI descriptions will ${value ? "load" : "not load"} next time.`);
            if (!value) {
                TopicDescriptionList = null;
            } else {
                loadJSON(TopicDescriptionList, "./index_files/Description.json");
            }
        }
    },
    "reset": {
        type: ToggleSetting,
        label: "Reset Settings",
        defaultValue: false,
        onChange: () => {
            Settings = {};
            localStorage.clear();
            saveHistoryAndBookmarks();
            location.reload();
        }
    }
}
