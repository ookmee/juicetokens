import { Component } from './base.js';
import { store, actions } from '../utils/store.js';

export default class Settings extends Component {
    constructor(element) {
        super(element);
        this.state = {
            settings: {
                debugMode: false,
                connectionType: 'test'
            }
        };

        // Subscribe to store updates
        this.unsubscribe = store.subscribe(this.handleStoreUpdate.bind(this));
    }

    handleStoreUpdate(state) {
        this.setState({
            settings: state.settings
        });
    }

    handleSettingChange(setting, value) {
        actions.updateSettings({ [setting]: value });
    }

    render() {
        this.clearElement();

        const container = this.createElement('div', 'settings-container');
        const title = this.createElement('h2', 'section-title', 'Settings');
        
        const settingsList = this.createElement('div', 'settings-list');
        
        // Debug Mode Toggle
        const debugSetting = this.createElement('div', 'setting-item');
        const debugLabel = this.createElement('label', 'setting-label', 'Debug Mode');
        const debugToggle = this.createElement('input', 'setting-toggle');
        debugToggle.type = 'checkbox';
        debugToggle.checked = this.state.settings.debugMode;
        debugToggle.addEventListener('change', (e) => {
            this.handleSettingChange('debugMode', e.target.checked);
        });
        debugSetting.appendChild(debugLabel);
        debugSetting.appendChild(debugToggle);
        
        // Connection Type Select
        const connectionSetting = this.createElement('div', 'setting-item');
        const connectionLabel = this.createElement('label', 'setting-label', 'Connection Type');
        const connectionSelect = this.createElement('select', 'setting-select');
        ['test', 'production'].forEach(type => {
            const option = this.createElement('option', '', type);
            option.value = type;
            option.selected = this.state.settings.connectionType === type;
            connectionSelect.appendChild(option);
        });
        connectionSelect.addEventListener('change', (e) => {
            this.handleSettingChange('connectionType', e.target.value);
        });
        connectionSetting.appendChild(connectionLabel);
        connectionSetting.appendChild(connectionSelect);

        settingsList.appendChild(debugSetting);
        settingsList.appendChild(connectionSetting);

        container.appendChild(title);
        container.appendChild(settingsList);
        this.element.appendChild(container);
    }

    destroy() {
        this.unsubscribe();
    }
} 