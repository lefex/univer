/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { DependentOn, IConfigService, Inject, Injector, Plugin, UniverInstanceType } from '@univerjs/core';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import { IRenderManagerService } from '@univerjs/engine-render';
import { UniverSheetsFormulaPlugin } from '@univerjs/sheets-formula';
import type { Dependency } from '@univerjs/core';
import { FORMULA_UI_PLUGIN_NAME } from './common/plugin-name';
import {
    defaultPluginBaseConfig,
    PLUGIN_CONFIG_KEY_BASE,
} from './controllers/config.schema';
import { FormulaAlertRenderController } from './controllers/formula-alert-render.controller';
import { FormulaAutoFillController } from './controllers/formula-auto-fill.controller';
import { FormulaClipboardController } from './controllers/formula-clipboard.controller';
import { FormulaEditorShowController } from './controllers/formula-editor-show.controller';
import { FormulaRenderManagerController } from './controllers/formula-render.controller';
import { FormulaUIController } from './controllers/formula-ui.controller';
import { PromptController } from './controllers/prompt.controller';
import { FormulaPromptService, IFormulaPromptService } from './services/prompt.service';
import { RefSelectionsRenderService } from './services/render-services/ref-selections.render-service';
import type { IUniverSheetsFormulaBaseConfig } from './controllers/config.schema';

/**
 * The configuration of the formula UI plugin.
 */
@DependentOn(UniverFormulaEnginePlugin, UniverSheetsFormulaPlugin)
export class UniverSheetsFormulaUIPlugin extends Plugin {
    static override pluginName = FORMULA_UI_PLUGIN_NAME;
    static override type = UniverInstanceType.UNIVER_SHEET;

    constructor(
        private readonly _config: Partial<IUniverSheetsFormulaBaseConfig> = defaultPluginBaseConfig,
        @Inject(Injector) override readonly _injector: Injector,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();

        // Manage the plugin configuration.
        const { menu, ...rest } = this._config;
        if (menu) {
            this._configService.setConfig('menu', menu, { merge: true });
        }
        this._configService.setConfig(PLUGIN_CONFIG_KEY_BASE, rest);
    }

    override onStarting(): void {
        const j = this._injector;
        const dependencies: Dependency[] = [
            [IFormulaPromptService, { useClass: FormulaPromptService }],
            [FormulaUIController],
            [FormulaAutoFillController],
            [FormulaClipboardController],
            [FormulaEditorShowController],
            [FormulaRenderManagerController],
            [PromptController],
        ];

        dependencies.forEach((dependency) => j.add(dependency));
    }

    override onRendered(): void {
        ([
            [RefSelectionsRenderService],
            [FormulaAlertRenderController],
        ] as Dependency[]).forEach((dep) => {
            this.disposeWithMe(this._renderManagerService.registerRenderModule(UniverInstanceType.UNIVER_SHEET, dep));
        });
    }
}