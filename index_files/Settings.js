let SubmenuWindow = null;

function setUpSettings() {
    document.getElementById("submunucont").innerHTML = "";
    document.getElementById("settings-list").innerHTML = "";
    SubmenuWindow = null;
    SubmenuWindow = document.createElement("div");
    SubmenuWindow.className = "submenu-window";
    SubmenuWindow.id = 'submenu';
    document.getElementById("submunucont").appendChild(SubmenuWindow);
    // Example Usage
    // Create a toggle for "Dark Mode" in a container with ID "settings-list"
    for (let setting in defaultSettings) {
        if (!(setting in Settings)) {
            Settings[setting] = defaultSettings[setting].defaultValue;
        }
        let settingObj = defaultSettings[setting];
        const mysetting = new settingObj.type({
            containerId: "settings-list",
            label: settingObj.label,
            options: settingObj.options,
            settingKey: setting,
            defaultValue: settingObj.defaultValue,
            onChange: settingObj.onChange,
            min: settingObj.min,
            max: settingObj.max,
            step: settingObj.step
        });
    }
    document.body.className = Settings.theme;
    console.log(`Theme changed to ${Settings.theme}`);
    fontSize = Settings.fontSize;
    document.body.className = Settings["invert-inputs"] ? "inverted-input-theme" : "main-theme";
    document.body.style.setProperty("--Foreground", Settings.Foreground);
    document.body.style.setProperty("--Background", Settings.Background);
    document.body.style.setProperty("--Accent1", Settings.Accent1);
    document.body.style.setProperty("--Accent2", Settings.Accent2);
}

class ToggleSetting {
    constructor({ containerId, label, settingKey, defaultValue = false, onChange }) {
        this.containerId = containerId;
        this.label = label;
        this.settingKey = settingKey;
        this.defaultValue = defaultValue;
        this.onChange = onChange;

        // Initialize the toggle setting
        this.init();
    }

    init() {
        // Get or create the container
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`Container with ID '${this.containerId}' not found.`);
            return;
        }

        // Create the setting row
        const settingRow = document.createElement("div");
        settingRow.className = "setting-row";

        // Create the label
        const labelEl = document.createElement("label");
        labelEl.className = "setting-label";
        labelEl.textContent = this.label;
        labelEl.setAttribute("for", `toggle-${this.settingKey}`); // Associate label with checkbox

        // Create the toggle switch
        const toggleWrapper = document.createElement("div");
        toggleWrapper.className = "toggle-wrapper";

        const toggleInput = document.createElement("input");
        toggleInput.type = "checkbox";
        toggleInput.className = "toggle-input";
        toggleInput.id = `toggle-${this.settingKey}`;
        toggleInput.checked = this.getSettingValue();

        const toggleSlider = document.createElement("span");
        toggleSlider.className = "toggle-slider";

        toggleWrapper.appendChild(toggleInput);
        toggleWrapper.appendChild(toggleSlider);

        // Append to the setting row
        settingRow.appendChild(labelEl);
        settingRow.appendChild(toggleWrapper);
        container.appendChild(settingRow);

        this.saveSetting(toggleInput.checked);
        // Listen for changes
        toggleInput.addEventListener("change", () => {
            this.saveSetting(toggleInput.checked);
            if (this.onChange) {
                this.onChange(toggleInput.checked);
            }
        });
        toggleSlider.addEventListener("click", () => {
            toggleInput.checked = !toggleInput.checked;
            this.saveSetting(toggleInput.checked);
            if (this.onChange) {
                this.onChange(toggleInput.checked);
            }
        });
    }

    // Save the toggle state to localStorage
    saveSetting(value) {
        localStorage.setItem(this.settingKey, value);
        Settings[this.settingKey] = value;
        saveHistoryAndBookmarks();
    }

    // Get the toggle state from localStorage
    getSettingValue() {
        if (this.settingKey in Settings) {
            return Settings[this.settingKey];
        }
        const storedValue = localStorage.getItem(this.settingKey);
        return storedValue === null ? this.defaultValue : storedValue === "true";
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

        // Initialize the pick setting
        this.init();
    }

    init() {
        // Get or create the container
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`Container with ID '${this.containerId}' not found.`);
            return;
        }

        // Create the setting row
        const settingRow = document.createElement("div");
        settingRow.className = "setting-row";

        const currentSettingValue = this.getSettingValue();
        let option = this.options.find(option => option.value === currentSettingValue);
        if (!option) {
            console.error(`Option with value '${currentSettingValue}' not found.`);
            option = this.options[0];
        }
        // Create the label
        const labelEl = document.createElement("label");
        labelEl.className = "setting-label";
        labelEl.textContent = `${this.label}: ${option.label}`;
        labelEl.setAttribute("for", `pick-${this.settingKey}`); // Associate label with select

        // Create the <select> element
        const selectEl = document.createElement("select");
        selectEl.className = "pick-select";
        selectEl.id = `pick-${this.settingKey}`;

        // Populate the options
        this.options.forEach(option => {
            const optionEl = document.createElement("option");
            optionEl.value = option.value;
            optionEl.textContent = option.label;
            if (currentSettingValue === option.value) {
                optionEl.selected = true;
            }
            selectEl.appendChild(optionEl);
        });

        // Append the label and select to the setting row
        settingRow.appendChild(labelEl);
        settingRow.appendChild(selectEl);
        container.appendChild(settingRow);

        this.saveSetting(selectEl.value);
        settingRow.addEventListener("click", () => {
            // open up selectEl
            selectEl.focus();
            selectEl.click();
        })

        // Listen for changes
        selectEl.addEventListener("change", () => {
            this.saveSetting(selectEl.value);
            if (this.onChange) {
                // find option with value selectEl.value
                const option = this.options.find(option => option.value === selectEl.value);
                labelEl.textContent = `${this.label}: ${option.label}`;

                this.onChange(selectEl.value);
            }
        });
    }

    // Save the selected value to localStorage
    saveSetting(value) {
        localStorage.setItem(this.settingKey, value);
        Settings[this.settingKey] = value;
        saveHistoryAndBookmarks();
    }

    // Get the selected value from localStorage
    getSettingValue() {
        if (this.settingKey in Settings) {
            return Settings[this.settingKey];
        }
        const storedValue = localStorage.getItem(this.settingKey);
        return storedValue === null ? this.defaultValue : storedValue;
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

        // Initialize the slider setting
        this.init();
    }

    init() {
        // Get or create the container
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`Container with ID '${this.containerId}' not found.`);
            return;
        }

        // Create the setting row
        const settingRow = document.createElement("div");
        settingRow.className = "setting-row";

        // Create the label
        const labelEl = document.createElement("label");
        labelEl.className = "setting-label";
        labelEl.textContent = `${this.label}: ${this.getSettingValue()}`;
        labelEl.setAttribute("for", `slider-${this.settingKey}`); // Associate label with input

        // Create the slider
        const slider = document.createElement("input");
        slider.type = "range";
        slider.className = "slider-input";
        slider.id = `slider-${this.settingKey}`;
        slider.min = this.min;
        slider.max = this.max;
        slider.value = this.getSettingValue();

        // Append the label and slider to the setting row
        settingRow.appendChild(labelEl);
        settingRow.appendChild(slider);
        container.appendChild(settingRow);

        this.saveSetting(slider.value);
        // Listen for changes
        slider.addEventListener("input", () => {
            labelEl.textContent = `${this.label}: ${slider.value}`;
            this.saveSetting(slider.value);
            if (this.onChange) {
                if (this.label == "Font Size") {
                    labelEl.style.fontSize = `${slider.value}px`;
                }
                this.onChange(slider.value);
            }
        });
    }

    // Save the slider value to localStorage
    saveSetting(value) {
        localStorage.setItem(this.settingKey, value);
        Settings[this.settingKey] = value;
        saveHistoryAndBookmarks();
    }

    // Get the slider value from localStorage
    getSettingValue() {
        if (this.settingKey in Settings) {
            return Settings[this.settingKey];
        }
        const storedValue = localStorage.getItem(this.settingKey);
        return storedValue === null ? this.defaultValue : storedValue;
    }

}

class ColorPickerSetting {
    constructor({ containerId, label, settingKey, defaultValue = "#FFFFFF", onChange }) {
        this.containerId = containerId;
        this.label = label;
        this.settingKey = settingKey;
        this.defaultValue = defaultValue;
        this.onChange = onChange;

        // Initialize the color picker setting
        this.init();
    }

    init() {
        // Get or create the container
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`Container with ID '${this.containerId}' not found.`);
            return;
        }

        // Create the setting row
        const settingRow = document.createElement("div");
        settingRow.className = "setting-row";

        // Create the label
        const labelEl = document.createElement("label");
        labelEl.className = "setting-label";
        labelEl.textContent = this.label;
        labelEl.setAttribute("for", `color-picker-${this.settingKey}`); // Associate label with input

        // Create the color input element
        const colorInput = document.createElement("input");
        colorInput.type = "button";
        colorInput.className = "color-picker-input";
        colorInput.id = `color-picker-${this.settingKey}`;
        colorInput.value = this.getSettingValue();
        colorInput.style.backgroundColor = colorInput.value;

        // Append the label and input to the setting row
        //color-picker-container
        const colorPickerContainer = document.createElement("div");
        colorPickerContainer.className = "color-picker-container";
        colorPickerContainer.value = colorInput.value;
        settingRow.appendChild(colorPickerContainer);
        settingRow.appendChild(labelEl);
        settingRow.appendChild(colorInput);
        container.appendChild(settingRow);

        this.saveSetting(colorInput.value);

        // Listen for changes
        colorInput.addEventListener("click", () => {
            const colorPicker = new ColorPicker(colorPickerContainer);
            colorPicker.onColorSelect = (color) => {
                colorInput.value = color;
                colorInput.style.backgroundColor = color;
                colorPickerContainer.value = color;
                this.saveSetting(color);
                if (this.onChange) {
                    this.onChange(color);
                }
            };
            this.saveSetting(colorInput.value);
            if (this.onChange) {
                this.onChange(colorInput.value);
            }
        });
    }

    // Save the color value to localStorage
    saveSetting(value) {
        localStorage.setItem(this.settingKey, value);
        Settings[this.settingKey] = value;
        saveHistoryAndBookmarks();
    }

    // Get the color value from localStorage
    getSettingValue() {
        if (this.settingKey in Settings) {
            return Settings[this.settingKey];
        }
        const storedValue = localStorage.getItem(this.settingKey);
        return storedValue === null ? this.defaultValue : storedValue;
    }
}

class BackButton {
    constructor({ containerId, label, onClick }) {
        this.containerId = containerId;
        this.label = label;
        this.onClick = onClick;

        // Initialize the back button
        this.init();
    }

    init() {
        // Get or create the container
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`Container with ID '${this.containerId}' not found.`);
            return;
        }
        // Create the setting row
        const settingRow = document.createElement("div");
        settingRow.className = "setting-row";
        // Create the back button
        const backButton = document.createElement("div");
        backButton.className = "setting-label";
        backButton.textContent = this.label;

        settingRow.appendChild(backButton)

        // Append the back button to the container
        container.appendChild(settingRow);

        // Listen for clicks
        backButton.addEventListener("click", () => {
            if (this.onClick) {
                this.onClick();
            }
        });
    }
}


class SettingsSubmenu {
    constructor({ containerId, label, settingKey, options = {} }) {
        this.containerId = containerId;
        this.label = label;
        this.options = options; // the submenu 
        this.settingKey = settingKey;

        // Initialize the submenu setting
        this.init();
    }

    init() {
        // Get or create the container
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`Container with ID '${this.containerId}' not found.`);
            return;
        }

        // Create the setting row
        const settingRow = document.createElement("div");
        settingRow.className = "setting-row";

        // Create the label
        const labelEl = document.createElement("label");
        labelEl.className = "setting-label";
        labelEl.textContent = this.label;
        labelEl.setAttribute("for", `submenu-${this.settingKey}`); // Associate label with select
        settingRow.appendChild(labelEl);
        container.appendChild(settingRow);

        labelEl.addEventListener("click", () => {
            new BackButton({
                containerId: "submenu",
                label: "Back",
                onClick: () => {
                    console.log(SubmenuWindow.style.display);
                    SubmenuWindow.style.display = "none";
                    SubmenuWindow.innerHTML = "";
                    console.log(SubmenuWindow.style.display);
                }
            });
            for (let setting in this.options) {
                let settingObj = this.options[setting];
                new settingObj.type({
                    containerId: "submenu",
                    label: settingObj.label,
                    options: settingObj.options,
                    settingKey: setting,
                    defaultValue: settingObj.defaultValue,
                    onChange: settingObj.onChange,
                    min: settingObj.min,
                    max: settingObj.max,
                    step: settingObj.step
                });
            }
            SubmenuWindow.style.display = "block";
        });
    }
}

class ColorPicker {
    constructor(containerElement) {
        // Create palettes and preview elements dynamically
        this.container = containerElement;
        this.container.className = "color-picker-container";
        this.container.style.display = 'flex';
        //onColorSelect
        this.onColorSelect = (color) => {
            console.log(`Color selected: ${color}`);
        };

        this.palettes = {
            hue: this.createElement('div', 'hue-palette'),
            saturation: this.createElement('div', 'saturation-palette'),
            lightness: this.createElement('div', 'lightness-palette'),
        };
        this.colorPreview = this.createElement('div', 'color-preview');
        this.colorPreview.className = "color-preview";

        this.colorCode = this.createElement('div', 'color-code');
        this.colorCode.className = "color-code";

        // Style color preview
        this.colorPreview.addEventListener('click', () => {
            const color = `hsl(${this.selectedHue.toFixed(1)}, ${this.selectedSaturation}%, ${this.selectedLightness}%)`;
            this.colorPreview.style.backgroundColor = color;
            this.colorCode.textContent = color;
            this.onColorSelect(color);
            this.destroy();
        })


        // Parse initial HSL values from container's value
        const initialColor = this.parseHSL(this.container.value || 'hsl(0, 100%, 50%)');
        this.selectedHue = initialColor.hue;
        this.selectedSaturation = initialColor.saturation;
        this.selectedLightness = initialColor.lightness;

        // Factor for hue distribution
        this.factor = (3 - Math.sqrt(5)) * 180;

        // Initialize palettes and preview
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

    createElement(tag, id) {
        const element = document.createElement(tag);
        element.id = id;
        this.container.appendChild(element);
        return element;
    }

    createPalette(palette, values, type) {
        palette.innerHTML = ''; // Clear existing colors
        palette.className = 'color-palette';

        values.forEach(value => {
            const colorBox = document.createElement('div');
            const color = type === 'hue'
                ? `hsl(${(value * this.factor) % 360}, ${this.selectedSaturation}%, ${this.selectedLightness}%)`
                : type === 'saturation'
                    ? `hsl(${this.selectedHue}, ${value}%, ${this.selectedLightness}%)`
                    : `hsl(${this.selectedHue}, ${this.selectedSaturation}%, ${value}%)`;

            colorBox.style.backgroundColor = color;
            colorBox.classList.add('color-box');
            colorBox.dataset.value = type === 'hue' ? (value * this.factor) % 360 : value;

            colorBox.addEventListener('click', () => {
                if (type === 'hue') this.selectedHue = parseFloat(colorBox.dataset.value);
                if (type === 'saturation') this.selectedSaturation = parseFloat(colorBox.dataset.value);
                if (type === 'lightness') this.selectedLightness = parseFloat(colorBox.dataset.value);

                this.update();

                // Update container value
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
        this.container.innerHTML = ''; // Clear the container
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
                    document.body.className = value ? "inverted-input-theme" : "main-theme";
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
            fontSize = value;
        }
    },
    "ShowHelp": {
        type: ToggleSetting,
        label: "Show Help On Load",
        defaultValue: true,
        onChange: (value) => {
            console.log(`Help will now be ${value ? "shown" : "hidden"} on Load`);
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
    "reset": {
        type: ToggleSetting,
        label: "Reset Settings",
        defaultValue: false,
        onClick: () => {
            Settings = {};
            saveHistoryAndBookmarks();
            localStorage.clear();
            location.reload();
        }
    }
}
