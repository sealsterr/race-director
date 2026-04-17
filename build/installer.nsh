!include FileFunc.nsh

!macro NormalizeLegacyInstallPath rootKey regPath folderVar
  ${GetParent} "${folderVar}" $R1
  ${If} "${folderVar}" == "$R1\RaceDirector TESTING"
    StrCpy "${folderVar}" "$R1\RaceDirector"
    WriteRegStr "${rootKey}" "${regPath}" "InstallLocation" "${folderVar}"
  ${EndIf}
!macroend

!macro customInit
  !insertmacro NormalizeLegacyInstallPath HKCU "${INSTALL_REGISTRY_KEY}" $perUserInstallationFolder
  !insertmacro NormalizeLegacyInstallPath HKLM "${INSTALL_REGISTRY_KEY}" $perMachineInstallationFolder

  ${GetParent} "$INSTDIR" $R1
  ${If} "$INSTDIR" == "$R1\RaceDirector TESTING"
    StrCpy $INSTDIR "$R1\RaceDirector"
  ${EndIf}
!macroend
