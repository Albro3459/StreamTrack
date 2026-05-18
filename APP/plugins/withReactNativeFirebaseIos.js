const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const firebaseStaticFrameworkFlag = "$RNFirebaseAsStaticFramework = true";

const firebasePodBuildSettings = `
def configure_react_native_firebase_pods(installer)
  installer.pods_project.targets.each do |target|
    next unless ['RNFBApp', 'RNFBAuth'].include?(target.name)

    target.build_configurations.each do |config|
      config.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'
    end
  end
end
`;

function addFirebaseStaticFrameworkFlag(podfile) {
    if (podfile.includes(firebaseStaticFrameworkFlag)) {
        return podfile;
    }

    return podfile.replace(
        /podfile_properties = JSON\.parse\(File\.read\(File\.join\(__dir__, 'Podfile\.properties\.json'\)\)\) rescue {}\n/,
        (match) => `${match}${firebaseStaticFrameworkFlag}\n`
    );
}

function addFirebasePodBuildSettings(podfile) {
    if (!podfile.includes("def configure_react_native_firebase_pods(installer)")) {
        podfile = podfile.replace(
            "\nENV['EX_DEV_CLIENT_NETWORK_INSPECTOR']",
            `${firebasePodBuildSettings}\nENV['EX_DEV_CLIENT_NETWORK_INSPECTOR']`
        );
    }

    if (podfile.includes("\n    configure_react_native_firebase_pods(installer)")) {
        return podfile;
    }

    return podfile.replace(
        /    react_native_post_install\(\n      installer,\n      config\[:reactNativePath\],\n      :mac_catalyst_enabled => false,\n      :ccache_enabled => ccache_enabled\?\(podfile_properties\),\n    \)\n/,
        (match) => `${match}\n    configure_react_native_firebase_pods(installer)\n`
    );
}

function patchPodfile(podfile) {
    return addFirebasePodBuildSettings(addFirebaseStaticFrameworkFlag(podfile));
}

module.exports = function withReactNativeFirebaseIos(config) {
    return withDangerousMod(config, [
        "ios",
        async (modConfig) => {
            const podfilePath = path.join(modConfig.modRequest.platformProjectRoot, "Podfile");
            const podfile = fs.readFileSync(podfilePath, "utf8");
            fs.writeFileSync(podfilePath, patchPodfile(podfile));
            return modConfig;
        },
    ]);
};
