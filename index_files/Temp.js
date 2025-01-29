
class GeneralSetting {
    constructor({
        type,                // "toggle", "pick", "slider", "colorPicker", "backButton", "submenu"
        containerElement,
        label,
        settingKey,
        defaultValue,
        onChange,
        parentContainer = null, // Parent container reference
        options = [],           // For "pick" type
        min,                   // For "slider" type
        max,                   // For "slider" type
        step,                  // For "slider" type
        submenuEntries = {},   // For "submenu" type
    }) {
        this.type = type;
        this.containerElement = containerElement || document.getElementById("setting-list");
        this.label = label;
        this.settingKey = settingKey;
        this.defaultValue = defaultValue;
        this.onChange = onChange;
        this.parentContainer = parentContainer;
        this.options = options;
        this.min = min;
        this.max = max;
        this.step = step;
        this.submenuEntries = submenuEntries;

        this.init();
    }

    init() {
        let settingInput;

        switch (this.type) {
            case "toggle":
                settingInput = document.createElement("input");
                settingInput.type = "checkbox";
                settingInput.className = "toggle-button";
                settingInput.checked = this.getSettingValue();
                settingInput.addEventListener("change", () => {
                    this.saveSetting(settingInput.checked);
                });
                break;

            case "pick":
                settingInput = document.createElement("select");
                settingInput.className = "pick-button";
                this.options.forEach(option => {
                    const optionEl = document.createElement("option");
                    optionEl.value = option.value;
                    optionEl.textContent = option.label;
                    if (option.value === this.getSettingValue()) {
                        optionEl.selected = true;
                    }
                    settingInput.appendChild(optionEl);
                });
                settingInput.addEventListener("change", () => {
                    this.saveSetting(settingInput.value);
                });
                break;

            case "slider":
                settingInput = document.createElement("input");
                settingInput.className = "slider-range";
                settingInput.type = "range";
                settingInput.min = this.min;
                settingInput.max = this.max;
                settingInput.step = this.step;
                settingInput.value = this.getSettingValue();
                settingInput.addEventListener("input", () => {
                    this.saveSetting(settingInput.value);
                });
                break;

            case "colorPicker":
                settingInput = document.createElement("input");
                settingInput.className = "color-picker";
                settingInput.type = "color";
                settingInput.value = this.getSettingValue();
                settingInput.addEventListener("input", () => {
                    this.saveSetting(settingInput.value);
                });
                break;

            case "backButton":
                settingInput = document.createElement("button");
                settingInput.textContent = "Back";
                settingInput.addEventListener("click", () => {
                    if (this.parentContainer) {
                        this.containerElement.remove();
                        //this.containerElement.style.display = "none";
                        //this.parentContainer.style.display = "block";
                    }
                });
                break;

            case "submenu":
                settingInput = document.createElement("button");
                settingInput.textContent = ">";
                settingInput.addEventListener("click", () => {
                    //this.containerElement.style.display = "";

                    const submenu = document.createElement("div");
                    submenu.className = "submenu-container";
                    this.containerElement.appendChild(submenu);

                    new GeneralSetting({
                        type: "backButton",
                        containerElement: submenu,
                        label: "Back",
                        parentContainer: this.containerElement
                    });

                    Object.entries(this.submenuEntries).forEach(([key, entry]) => {
                        new GeneralSetting({
                            ...entry,
                            containerElement: submenu,
                            parentContainer: this.containerElement
                        });
                    });
                });
                break;

            default:
                console.error(`Invalid setting type: ${this.type}`);
                return;
        }

        const { settingRow } = this.createSettingElement(settingInput);
        this.containerElement.appendChild(settingRow);
    }

    createSettingElement(settingInput) {
        const settingRow = document.createElement("div");
        settingRow.className = "setting-row";

        const labelEl = document.createElement("label");
        labelEl.textContent = this.label;
        labelEl.setAttribute("for", `setting-${this.settingKey}`);

        settingInput.className = "setting-input";
        settingInput.id = `setting-${this.settingKey}`;
        settingInput.setAttribute("data-setting-key", this.settingKey);

        settingRow.appendChild(labelEl);
        settingRow.appendChild(settingInput);

        return { settingRow, labelEl, settingInput };
    }

    getSettingValue() {
        const storedValue = localStorage.getItem(this.settingKey);
        return storedValue !== null ? JSON.parse(storedValue) : this.defaultValue;
    }

    saveSetting(value) {
        Settings[this.settingKey] = value;
        localStorage.setItem(this.settingKey, JSON.stringify(value));
        if (this.onChange) {
            this.onChange(value);
        }
    }
}

function setUpSettings() {
    const settingsContainer = document.getElementById("settings-list");
    settingsContainer.innerHTML = "";

    new GeneralSetting({
        type: "toggle",
        containerElement: settingsContainer,
        label: "Dark Mode",
        settingKey: "darkMode",
        defaultValue: false,
        onChange: (value) => {
            document.body.className = value ? "dark-theme" : "main-theme";
        }
    });

    new GeneralSetting({
        type: "slider",
        containerElement: settingsContainer,
        label: "Font Size",
        settingKey: "fontSize",
        defaultValue: 16,
        min: 4,
        max: 64,
        step: 1,
        onChange: (value) => {
            document.body.style.fontSize = `${value}px`;
        }
    });

    new GeneralSetting({
        type: "pick",
        containerElement: settingsContainer,
        label: "Theme",
        settingKey: "theme",
        defaultValue: "main-theme",
        options: [
            { value: "main-theme", label: "Main Theme" },
            { value: "dark-theme", label: "Dark Theme" },
            { value: "inverted-input-theme", label: "Inverted Input Theme" }
        ],
        onChange: (value) => {
            document.body.className = value;
        }
    });

    new GeneralSetting({
        type: "submenu",
        containerElement: settingsContainer,
        label: "Advanced Settings",
        settingKey: "submenu",
        submenuEntries: {
            submenu1: {
                type: "toggle",
                label: "Submenu Option 1",
                settingKey: "submenu1",
                defaultValue: false,
                onChange: (value) => {
                    console.log(`Submenu Option 1 is ${value ? "enabled" : "disabled"}`);
                }
            },
            submenu2: {
                type: "toggle",
                label: "Submenu Option 2",
                settingKey: "submenu2",
                defaultValue: true,
                onChange: (value) => {
                    console.log(`Submenu Option 2 is ${value ? "enabled" : "disabled"}`);
                }
            }
        }
    });
}

document.addEventListener("DOMContentLoaded", setUpSettings);
