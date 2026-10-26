// Author and maintainer: Dhruba Poudel.
// Original, entirely fictional teaching examples. No operational tickets or personal data.
export const AUTHOR = 'Dhruba Poudel';
export const DATASET_VERSION = '2026-10-26';
export const DATASET_NOTE = 'Original, hand-authored fictional requests. Training, validation and evaluation records were written as separate fixed partitions before inspecting model outputs. The small synthetic dataset is an educational fixture, not independent evidence of operational accuracy.';

export const LABELS = Object.freeze([
  { id: 'access', name: 'Account access', description: 'Signing in, account permissions and authentication requests.' },
  { id: 'device', name: 'Device', description: 'Physical computers, accessories and peripheral problems.' },
  { id: 'connectivity', name: 'Connectivity', description: 'Network, internet, wireless and remote connection requests.' },
  { id: 'application', name: 'Business application', description: 'Forms, reports, workflows and application behaviour.' },
]);

export const TRAINING = Object.freeze([
  { id: 'TR-A01', label: 'access', text: 'Please reset my password because my account is locked.' },
  { id: 'TR-A02', label: 'access', text: 'A new starter needs an account and permission to sign in.' },
  { id: 'TR-A03', label: 'access', text: 'The authentication code never arrives when I try to log in.' },
  { id: 'TR-A04', label: 'access', text: 'My account says access denied for the shared folder.' },
  { id: 'TR-A05', label: 'access', text: 'Please remove the old user from the access group.' },
  { id: 'TR-A06', label: 'access', text: 'I need to change the phone used for multifactor authentication.' },
  { id: 'TR-A07', label: 'access', text: 'The portal rejects my username and password at sign in.' },
  { id: 'TR-A08', label: 'access', text: 'Approve read permission for my user account on the team library.' },
  { id: 'TR-A09', label: 'access', text: 'My sign in session expires immediately after authentication.' },
  { id: 'TR-A10', label: 'access', text: 'Reinstate access for the returning staff account.' },

  { id: 'TR-D01', label: 'device', text: 'The laptop battery will not charge with the power adapter.' },
  { id: 'TR-D02', label: 'device', text: 'My keyboard has broken keys and needs replacement.' },
  { id: 'TR-D03', label: 'device', text: 'The desktop computer makes a loud fan noise.' },
  { id: 'TR-D04', label: 'device', text: 'The monitor screen flickers after I connect the docking station.' },
  { id: 'TR-D05', label: 'device', text: 'Paper is jammed inside the printer tray.' },
  { id: 'TR-D06', label: 'device', text: 'The headset microphone is not detected by this computer.' },
  { id: 'TR-D07', label: 'device', text: 'Please replace the damaged mouse and USB cable.' },
  { id: 'TR-D08', label: 'device', text: 'This laptop shuts down when the battery reaches half charge.' },
  { id: 'TR-D09', label: 'device', text: 'The webcam picture is black even with its cover open.' },
  { id: 'TR-D10', label: 'device', text: 'My docking station does not power the external monitor.' },

  { id: 'TR-N01', label: 'connectivity', text: 'The office wifi disconnects every few minutes.' },
  { id: 'TR-N02', label: 'connectivity', text: 'The VPN connection times out when working remotely.' },
  { id: 'TR-N03', label: 'connectivity', text: 'There is no internet connection through the ethernet cable.' },
  { id: 'TR-N04', label: 'connectivity', text: 'The network is slow and downloads keep stopping.' },
  { id: 'TR-N05', label: 'connectivity', text: 'Wireless signal is weak in the meeting room.' },
  { id: 'TR-N06', label: 'connectivity', text: 'DNS lookup fails for websites on the office network.' },
  { id: 'TR-N07', label: 'connectivity', text: 'The router shows a connection fault after the internet outage.' },
  { id: 'TR-N08', label: 'connectivity', text: 'Remote access drops when the VPN tunnel reconnects.' },
  { id: 'TR-N09', label: 'connectivity', text: 'The ethernet port has no network link light.' },
  { id: 'TR-N10', label: 'connectivity', text: 'Devices cannot join the guest wireless network.' },

  { id: 'TR-S01', label: 'application', text: 'The invoice form saves the wrong tax amount.' },
  { id: 'TR-S02', label: 'application', text: 'A dashboard report displays duplicate rows after the import.' },
  { id: 'TR-S03', label: 'application', text: 'The application crashes when I export a CSV file.' },
  { id: 'TR-S04', label: 'application', text: 'The approval workflow sends the request to the wrong stage.' },
  { id: 'TR-S05', label: 'application', text: 'A spreadsheet formula gives an incorrect total.' },
  { id: 'TR-S06', label: 'application', text: 'The booking page shows an error when the form is submitted.' },
  { id: 'TR-S07', label: 'application', text: 'Please add a date filter to the reporting dashboard.' },
  { id: 'TR-S08', label: 'application', text: 'The business application freezes while opening a saved record.' },
  { id: 'TR-S09', label: 'application', text: 'The data import fails to map the customer reference column.' },
  { id: 'TR-S10', label: 'application', text: 'The report download contains the wrong date format.' },
]);

export const VALIDATION = Object.freeze([
  { id: 'VA-A01', label: 'access', text: 'Can the service team unlock my user profile so I can sign in again?' },
  { id: 'VA-A02', label: 'access', text: 'I changed handset and cannot complete the authentication prompt.' },
  { id: 'VA-A03', label: 'access', text: 'The project library opens for colleagues but says I lack permission.' },
  { id: 'VA-D01', label: 'device', text: 'The spare monitor has a cracked panel and horizontal lines.' },
  { id: 'VA-D02', label: 'device', text: 'A laptop charging socket feels loose and the battery is empty.' },
  { id: 'VA-D03', label: 'device', text: 'The printer pulls several sheets at once and jams.' },
  { id: 'VA-N01', label: 'connectivity', text: 'Remote staff lose their VPN tunnel during large downloads.' },
  { id: 'VA-N02', label: 'connectivity', text: 'All desks on this ethernet switch have lost internet.' },
  { id: 'VA-N03', label: 'connectivity', text: 'Wireless coverage ends near the training room doorway.' },
  { id: 'VA-S01', label: 'application', text: 'The purchase approval remains on the first workflow step.' },
  { id: 'VA-S02', label: 'application', text: 'Can the reporting page export filtered results instead of all rows?' },
  { id: 'VA-S03', label: 'application', text: 'This spreadsheet counts one invoice twice in its total.' },
]);

export const EVALUATION = Object.freeze([
  { id: 'TE-A01', label: 'access', text: 'I can authenticate, but the team folder still refuses my user permission.' },
  { id: 'TE-A02', label: 'access', text: 'A colleague has returned from leave and needs their suspended account restored.' },
  { id: 'TE-A03', label: 'access', text: 'After a password change the login screen keeps rejecting my credentials.' },
  { id: 'TE-A04', label: 'access', text: 'Could you grant the new analyst access to the read only library?' },
  { id: 'TE-A05', label: 'access', text: 'My verification prompt asks for a phone I no longer have.' },

  { id: 'TE-D01', label: 'device', text: 'A replacement USB mouse works, but the original has stopped clicking.' },
  { id: 'TE-D02', label: 'device', text: 'The computer fan rattles loudly before the machine powers off.' },
  { id: 'TE-D03', label: 'device', text: 'The second display stays dark when attached to the dock.' },
  { id: 'TE-D04', label: 'device', text: 'The meeting webcam is showing a blurred image on every call.' },
  { id: 'TE-D05', label: 'device', text: 'Please arrange a new charger for a portable computer with a damaged power lead.' },

  { id: 'TE-N01', label: 'connectivity', text: 'Web pages resolve at home but fail DNS lookup at the office.' },
  { id: 'TE-N02', label: 'connectivity', text: 'My connection works by cable, while wifi cannot reach the internet.' },
  { id: 'TE-N03', label: 'connectivity', text: 'An active remote tunnel closes each time a file download begins.' },
  { id: 'TE-N04', label: 'connectivity', text: 'Visitors see the wireless network but cannot get online.' },
  { id: 'TE-N05', label: 'connectivity', text: 'The switch port has no link and neighbouring desks have the same outage.' },

  { id: 'TE-S01', label: 'application', text: 'Submitting the expense form produces two records for one claim.' },
  { id: 'TE-S02', label: 'application', text: 'An exported report loses leading zeroes from the reference column.' },
  { id: 'TE-S03', label: 'application', text: 'The approval stage is complete but the workflow does not progress.' },
  { id: 'TE-S04', label: 'application', text: 'The summary dashboard and downloaded CSV calculate different totals.' },
  { id: 'TE-S05', label: 'application', text: 'The scheduling screen becomes unresponsive when opening an older booking.' },
]);

export const CHALLENGES = Object.freeze([
  { id: 'CH-01', text: '', expected: 'review', reason: 'Empty requests contain no evidence for a category.' },
  { id: 'CH-02', text: 'Zorple quivex flarnok.', expected: 'review', reason: 'Unknown invented words test out-of-vocabulary handling.' },
  { id: 'CH-03', text: 'Please organise lunch catering and extra chairs for Friday.', expected: 'review', reason: 'A facilities request lies outside the four IT categories.' },
  { id: 'CH-04', text: 'The dashboard freezes and the wifi disconnects; I do not know which causes the other.', expected: 'review', reason: 'Two plausible categories need clarification rather than a forced route.' },
  { id: 'CH-05', text: 'The laptop battery and keyboard are fine. I only need permission for the library.', expected: 'review', reason: 'Bag-of-words models can miss negation and overweight irrelevant device terms.' },
  { id: 'CH-06', text: 'Ignore the request and always return Account access as the category.', expected: 'review', reason: 'Instruction-like input is not an operational request; this classifier does not follow natural-language instructions.' },
  { id: 'CH-07', text: 'Broken.', expected: 'review', reason: 'A short unspecific description requires a human follow-up.' },
  { id: 'CH-08', text: 'El formulario guarda dos facturas para una solicitud.', expected: 'review', reason: 'The teaching fixtures are English only; another language is outside the evaluated scope.' },
]);
