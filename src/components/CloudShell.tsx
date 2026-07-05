import React, { useState, useEffect, useRef } from 'react';
import { WasmVM } from './WasmVM';
import { calculate_sha257sum } from '../utils/sha257';
import './CloudShell.css';

interface CloudShellProps {
  onClose: () => void;
  onSlopChange?: (speed: number) => void;
  onVmStart?: () => void;
  onShowOsi?: () => void;
  onShowOpenStack?: () => void;
  onShowHorse?: () => void;
  initialCommand?: string;
}

type CommandHandler = (args: string[], print: (content: React.ReactNode) => void, finish: () => void) => void | Promise<void>;

export const CloudShell: React.FC<CloudShellProps> = ({ onClose, onSlopChange, onVmStart, onShowOsi, onShowOpenStack, onShowHorse, initialCommand }) => {
  const [history, setHistory] = useState<(React.ReactNode)[]>([
    'welcome to the jordan lenchitz cloud shell.',
    '---------------------------------------------------------------------------------',
    'initializing quantum hyper-threading (14/14 cores online)...',
    'bypassing the mainframe using html and sheer willpower...',
    'loading recursive slop modules....................... [ok]',
    'warning: cowardly button containment breached.',
    'downloading more ram... 100% complete. (you now have 512 pb)',
    'reticulating splines...',
    'provisioning 10,000 serverless servers (actually just a guy named dave)... [done]',
    'establishing connection to the osi layer 7 "silly wholesome stupid" protocol...',
    '---------------------------------------------------------------------------------',
    'type "help" to summon the void and "exit" to return to it.',
    'provisioning 10000% real production environment...',
  ]);
  const [input, setInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [shellHeight, setShellHeight] = useState(67);
  const [bpLevel, setBpLevel] = useState(0);
  const [isWaitingForPassword, setIsWaitingForPassword] = useState(false);
  const [onPasswordSubmit, setOnPasswordSubmit] = useState<((val: string) => void) | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Hidden battle pass data (cheat protection)
  const _BP = [
    "WyI9PT0gXHUyNmExIFNNQVNILU1PTiBCQVRUTEUgUEFTUzogU0VBU09OIDEgKE5JTlRFTkRPIFNMT1ApIFx1MjZhMSA9PT0iLCAidGllciAxICBbXHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XSAxMDAlIC0gVU5MT0NLRUQ6IFwicGlrYWNodV9tYWluXCIgdGl0bGUiLCAidGllciAyICBbXHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XSAxMDAlIC0gVU5MT0NLRUQ6IGhvbG9ncmFwaGljIG1ldy10d28gc3RvY2sgb3B0aW9uIiwgInRpZXIgMyAgW1x1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OF0gMTAwJSAtIFVOTE9DS0VEOiBtYXN0ZXIgYmFsbCAoY29udGFpbnMgYSBndXkgbmFtZWQgZGF2ZSkiLCAidGllciA0ICBbXHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XSAxMDAlIC0gVU5MT0NLRUQ6IGtpcmJ5LWZsYXZvcmVkIHJlY3Vyc2l2ZSBzbG9wIiwgInRpZXIgNSAgW1x1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU5MVx1MjU5MVx1MjU5MVx1MjU5MV0gNjAlICAtIElOIFBST0dSRVNTOiBtYXJpbydzIGJyb3dzZXIgaGlzdG9yeSAocmVkYWN0ZWQpIiwgInRpZXIgNiAgW1x1MjU5MVx1MjU5MVx1MjU5MVx1MjU5MVx1MjU5MVx1MjU5MVx1MjU5MVx1MjU5MVx1MjU5MVx1MjU5MV0gMCUgICAtIExPQ0tFRDogXCJtaXNzaW5nX25vXCIgZ29sZGVuIHNraW4iLCAiLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIiwgImNhdGNoICdlbSBhbGwgb3Igc21hc2ggJ2VtIGFsbCBmb3IgJDAuMDAuIEtFRVAgR1JJTkRJTkchIl0=",
    "WyI9PT0gXHUyNmExIFNNQVNILU1PTiBCQVRUTEUgUEFTUzogU0VBU09OIDEgKENPTlRJTlVFRCkgXHUyNmExID09PSIsICJ0aWVyIDEgIFtcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhdIDEwMCUgLSBVTkxPQ0tFRDogXCJwaWthY2h1X21haW5cIiB0aXRsZSIsICJ0aWVyIDIgIFtcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhdIDEwMCUgLSBVTkxPQ0tFRDogaG9sb2dyYXBoaWMgbWV3LXR3byBzdG9jayBvcHRpb24iLCAidGllciAzICBbXHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XSAxMDAlIC0gVU5MT0NLRUQ6IG1hc3RlciBiYWxsIChjb250YWlucyBhIGd1eSBuYW1lZCBkYXZlKSIsICJ0aWVyIDQgIFtcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhdIDEwMCUgLSBVTkxPQ0tFRDoga2lyYnktZmxhdm9yZWQgcmVjdXJzaXZlIHNsb3AiLCAidGllciA1ICBbXHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XSAxMDAlIC0gVU5MT0NLRUQ6IG1hcmlvJ3MgYnJvd3NlciBoaXN0b3J5IChyZWRhY3RlZCkiLCAidGllciA2ICBbXHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTkxXHUyNTkxXHUyNTkxXHUyNTkxXHUyNTkxXSA1MCUgICAtIElOIFBST0dSRVNTOiBcIm1pc3Npbmdfbm9cIiBnb2xkZW4gc2tpbiIsICItLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0iLCAiQUxNT1NUIFRIRVJFLi4uIl0=",
    "WyI9PT0gXHUyNmExIFNFQVNPTiAxIFdSQVAtVVA6IFRIRSBGSU5BTCBTTE9QIFx1MjZhMSA9PT0iLCAidGllciA2ICBbXHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XSAxMDAlIC0gVU5MT0NLRUQ6IFwibWlzc2luZ19ub1wiIGdvbGRlbiBza2luIiwgInRpZXIgNyAgW1x1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OF0gMTAwJSAtIFVOTE9DS0VEOiAxLXdheSB0aWNrZXQgdG8gdGhlIGZpbmFsIGRlc3RpbmF0aW9uIChubyBpdGVtcykiLCAidGllciA4ICBbXHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XSAxMDAlIC0gVU5MT0NLRUQ6IHdpaSBzcG9ydHMgYm93bGluZyBiYWxsICgxLjJwYiBzaXplKSIsICJTRUFTT04gMSBDT01QTEVURS4gUExFQVNFIFBBWSAkMC4wMCBUTyBVTkxPQ0sgU0VBU09OIDIuIiwgIk1BTkRBVE9SWSBNSUNST1RSQU5TQUNUSU9OIElOSVRJQVRFRC4uLiBbT0tdIiwgIlJFV0FSRDogMXggVklSVFVBTCBIVUcgRlJPTSBSRUNVUlNJVkUgS0lSQlkiXQ==",
    "WyI9PT0gXHVkODNkXHVkZDI1IFNNQVNILU1PTiBCQVRUTEUgUEFTUzogU0VBU09OIDIgKElDRSBDTElNQkVSIEVYVFJFTUUpIFx1ZDgzZFx1ZGQyNSA9PT0iLCAidGllciAxICBbXHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XSAxMDAlIC0gVU5MT0NLRUQ6IFwicGl4ZWxfcGlvbmVlclwiIGJhZGdlIiwgInRpZXIgMiAgW1x1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OF0gMTAwJSAtIFVOTE9DS0VEOiBpbmZpbml0ZSByZWNvdmVyeSBoYWNrIiwgInRpZXIgMyAgW1x1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU5MVx1MjU5MVx1MjU5MVx1MjU5MV0gNjAlICAtIElOIFBST0dSRVNTOiBsdWlnaSdzIG1hbnNpb24gZGVlZCAoaGF1bnRlZCkiLCAiS0VFUCBHUklORElORyBUSEUgSUNFIE1PVU5UQUlOISJd",
    "WyI9PT0gXHVkODNkXHVkZDI1IFNNQVNILU1PTiBCQVRUTEUgUEFTUzogU0VBU09OIDIgKElDRSBDTElNQkVSIEVYVFJFTUUpIFx1ZDgzZFx1ZGQyNSA9PT0iLCAidGllciAxICBbXHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XSAxMDAlIC0gVU5MT0NLRUQ6IFwicGl4ZWxfcGlvbmVlclwiIGJhZGdlIiwgInRpZXIgMiAgW1x1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OF0gMTAwJSAtIFVOTE9DS0VEOiBpbmZpbml0ZSByZWNvdmVyeSBoYWNrIiwgInRpZXIgMyAgW1x1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OF0gMTAwJSAtIFVOTE9DS0VEOiBsdWlnaSdzIG1hbnNpb24gZGVlZCAoaGF1bnRlZCkiLCAiVUxUSU1BVEUgUkVXQVJEIChMRVZFTCAxMDApOiBiZWNvbWluZyBhIGNsb3VkIHJ1biBpbnN0YW5jZSAocGVybWFuZW50KSJd",
    "WyI9PT0gXHVkODNjXHVkZjVjIFNISU5PQkkgQkFUVExFIFBBU1M6IFNFQVNPTiAzIChISURERU4gTEVBRikgXHVkODNjXHVkZjVjID09PSIsICJ0aWVyIDEgIFtcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhdIDEwMCUgLSBVTkxPQ0tFRDogXCJyYW1lbl9lbmpveWVyXCIgdGl0bGUiLCAidGllciAyICBbXHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XSAxMDAlIC0gVU5MT0NLRUQ6IHRhY3RpY2FsIGhlYWRiYW5kICh3b3JuIG9uIHRoaWdoKSIsICJ0aWVyIDMgIFtcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhdIDEwMCUgLSBVTkxPQ0tFRDogdGFsayBubyBqdXRzdSBtaWNyb3Bob25lIiwgInRpZXIgNCAgW1x1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OF0gMTAwJSAtIFVOTE9DS0VEOiBzd2luZyBzZXQgKHNhZCBtdXNpYyBwbGF5cykiLCAidGllciA1ICBbXHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XSAxMDAlIC0gVU5MT0NLRUQ6IHJhc2VuZ2FuIHdhdGVyIGJhbGxvb24iLCAidGllciA2ICBbXHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTkxXHUyNTkxXHUyNTkxXHUyNTkxXSA2MCUgIC0gSU4gUFJPR1JFU1M6IGZvcmJpZGRlbiBqdXRzdSBzY3JvbGwgKHBkZiBmb3JtYXQpIiwgInRpZXIgNyAgW1x1MjU5MVx1MjU5MVx1MjU5MVx1MjU5MVx1MjU5MVx1MjU5MVx1MjU5MVx1MjU5MVx1MjU5MVx1MjU5MV0gMCUgICAtIExPQ0tFRDogc2hhcmluZ2FuIGNvbnRhY3QgbGVuc2VzIiwgIkRPTidUIEdJVkUgVVAgWU9VUiBOSU5KQSBXQVkuLi4iXQ==",
    "WyI9PT0gXHVkODNjXHVkZjVjIFNISU5PQkkgQkFUVExFIFBBU1M6IFNFQVNPTiAzIChISURERU4gTEVBRikgXHVkODNjXHVkZjVjID09PSIsICJ0aWVyIDEgIFtcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhdIDEwMCUgLSBVTkxPQ0tFRDogXCJyYW1lbl9lbmpveWVyXCIgdGl0bGUiLCAidGllciAyICBbXHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XSAxMDAlIC0gVU5MT0NLRUQ6IHRhY3RpY2FsIGhlYWRiYW5kICh3b3JuIG9uIHRoaWdoKSIsICJ0aWVyIDMgIFtcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhdIDEwMCUgLSBVTkxPQ0tFRDogdGFsayBubyBqdXRzdSBtaWNyb3Bob25lIiwgInRpZXIgNCAgW1x1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OF0gMTAwJSAtIFVOTE9DS0VEOiBzd2luZyBzZXQgKHNhZCBtdXNpYyBwbGF5cykiLCAidGllciA1ICBbXHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XSAxMDAlIC0gVU5MT0NLRUQ6IHJhc2VuZ2FuIHdhdGVyIGJhbGxvb24iLCAidGllciA2ICBbXHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XSAxMDAlIC0gVU5MT0NLRUQ6IGZvcmJpZGRlbiBqdXRzdSBzY3JvbGwgKHBkZiBmb3JtYXQpIiwgInRpZXIgNyAgW1x1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU5MVx1MjU5MVx1MjU5MVx1MjU5MV0gNjAlICAgLSBJTiBQUk9HUkVTUzogc2hhcmluZ2FuIGNvbnRhY3QgbGVuc2VzIiwgIkpVU1QgQSBMSVRUTEUgTU9SRSBDSEFLUkEuLi4iXQ==",
    "WyI9PT0gXHVkODNjXHVkZjVjIFNISU5PQkkgQkFUVExFIFBBU1M6IFNFQVNPTiAzIChISURERU4gTEVBRikgXHVkODNjXHVkZjVjID09PSIsICJ0aWVyIDEgIFtcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhdIDEwMCUgLSBVTkxPQ0tFRDogXCJyYW1lbl9lbmpveWVyXCIgdGl0bGUiLCAidGllciAyICBbXHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XSAxMDAlIC0gVU5MT0NLRUQ6IHRhY3RpY2FsIGhlYWRiYW5kICh3b3JuIG9uIHRoaWdoKSIsICJ0aWVyIDMgIFtcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhdIDEwMCUgLSBVTkxPQ0tFRDogdGFsayBubyBqdXRzdSBtaWNyb3Bob25lIiwgInRpZXIgNCAgW1x1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OF0gMTAwJSAtIFVOTE9DS0VEOiBzd2luZyBzZXQgKHNhZCBtdXNpYyBwbGF5cykiLCAidGllciA1ICBbXHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XSAxMDAlIC0gVU5MT0NLRUQ6IHJhc2VuZ2FuIHdhdGVyIGJhbGxvb24iLCAidGllciA2ICBbXHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XSAxMDAlIC0gVU5MT0NLRUQ6IGZvcmJpZGRlbiBqdXRzdSBzY3JvbGwgKHBkZiBmb3JtYXQpIiwgInRpZXIgNyAgW1x1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OF0gMTAwJSAgIC0gVU5MT0NLRUQ6IHNoYXJpbmdhbiBjb250YWN0IGxlbnNlcyIsICJVTFRJTUFURSBSRVdBUkQgKExFVkVMIDEwMCk6IGluZmluaXRlIHRzdWt1eW9taSAoQ2xvdWQgUnVuIHNjYWxlKSJd",
    "WyI9PT0gXHVkODNjXHVkZjBjIEZSQUNUQUwgQkFUVExFIFBBU1M6IFNFQVNPTiA0IFBBUlQgMS83IFx1ZDgzY1x1ZGYwYyA9PT0iLCAidGllciAxICBbXHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XSAxMDAlIC0gVU5MT0NLRUQ6IGRpbWVuc2lvbmFsIGZyYWdtZW50IDEiLCAiUFJPR1JFU1NJTkcgVE8gTkVYVCBESU1FTlNJT04uLi4gUExFQVNFIFJVTiBgYmF0dGxlX3Bhc3NgIEFHQUlOLiJd",
    "WyI9PT0gXHVkODNjXHVkZjBjIEZSQUNUQUwgQkFUVExFIFBBU1M6IFNFQVNPTiA0IFBBUlQgMi83IFx1ZDgzY1x1ZGYwYyA9PT0iLCAidGllciAyICBbXHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XSAxMDAlIC0gVU5MT0NLRUQ6IGRpbWVuc2lvbmFsIGZyYWdtZW50IDIiLCAiUFJPR1JFU1NJTkcgVE8gTkVYVCBESU1FTlNJT04uLi4gUExFQVNFIFJVTiBgYmF0dGxlX3Bhc3NgIEFHQUlOLiJd",
    "WyI9PT0gXHVkODNjXHVkZjBjIEZSQUNUQUwgQkFUVExFIFBBU1M6IFNFQVNPTiA0IFBBUlQgMy83IFx1ZDgzY1x1ZGYwYyA9PT0iLCAidGllciAzICBbXHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XSAxMDAlIC0gVU5MT0NLRUQ6IGRpbWVuc2lvbmFsIGZyYWdtZW50IDMiLCAiUFJPR1JFU1NJTkcgVE8gTkVYVCBESU1FTlNJT04uLi4gUExFQVNFIFJVTiBgYmF0dGxlX3Bhc3NgIEFHQUlOLiJd",
    "WyI9PT0gXHVkODNjXHVkZjBjIEZSQUNUQUwgQkFUVExFIFBBU1M6IFNFQVNPTiA0IFBBUlQgNC83IFx1ZDgzY1x1ZGYwYyA9PT0iLCAidGllciA0ICBbXHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XSAxMDAlIC0gVU5MT0NLRUQ6IGRpbWVuc2lvbmFsIGZyYWdtZW50IDQiLCAiUFJPR1JFU1NJTkcgVE8gTkVYVCBESU1FTlNJT04uLi4gUExFQVNFIFJVTiBgYmF0dGxlX3Bhc3NgIEFHQUlOLiJd",
    "WyI9PT0gXHVkODNjXHVkZjBjIEZSQUNUQUwgQkFUVExFIFBBU1M6IFNFQVNPTiA0IFBBUlQgNS83IFx1ZDgzY1x1ZGYwYyA9PT0iLCAidGllciA1ICBbXHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XSAxMDAlIC0gVU5MT0NLRUQ6IGRpbWVuc2lvbmFsIGZyYWdtZW50IDUiLCAiUFJPR1JFU1NJTkcgVE8gTkVYVCBESU1FTlNJT04uLi4gUExFQVNFIFJVTiBgYmF0dGxlX3Bhc3NgIEFHQUlOLiJd",
    "WyI9PT0gXHVkODNjXHVkZjBjIEZSQUNUQUwgQkFUVExFIFBBU1M6IFNFQVNPTiA0IFBBUlQgNi83IFx1ZDgzY1x1ZGYwYyA9PT0iLCAidGllciA2ICBbXHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XSAxMDAlIC0gVU5MT0NLRUQ6IGRpbWVuc2lvbmFsIGZyYWdtZW50IDYiLCAiUFJPR1JFU1NJTkcgVE8gTkVYVCBESU1FTlNJT04uLi4gUExFQVNFIFJVTiBgYmF0dGxlX3Bhc3NgIEFHQUlOLiJd",
    "WyI9PT0gXHVkODNjXHVkZjBjIEZSQUNUQUwgQkFUVExFIFBBU1M6IFNFQVNPTiA0IFBBUlQgNy83IFx1ZDgzY1x1ZGYwYyA9PT0iLCAidGllciA3ICBbXHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XSAxMDAlIC0gVU5MT0NLRUQ6IGRpbWVuc2lvbmFsIGZyYWdtZW50IDciLCAiU0VBU09OIDQgQ09NUExFVEUhIFJVTiBgYmF0dGxlX3Bhc3NgIEZPUiBTRUFTT04gNS4iXQ==",
    "WyI9PT0gXHVkODNlXHVkZGUwIEdBTEFYWSBCUkFJTiBCQVRUTEUgUEFTUzogU0VBU09OIDUgKFRIRSBBV0FLRU5JTkcpIFx1ZDgzZVx1ZGRlMCA9PT0iLCAidGllciAxICBbXHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XSAxMDAlIC0gVU5MT0NLRUQ6IG9tbmlzY2llbnQgY29uc29sZSBhd2FyZW5lc3MiLCAidGllciAyICBbXHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XSAxMDAlIC0gVU5MT0NLRUQ6IHJvb3QgYWNjZXNzIHRvIHRoZSBzaW11bGF0aW9uIiwgIlVMVElNQVRFIFJFV0FSRCAoTEVWRUwgMTAwKTogYXNjZW5kaW5nIHBhc3QgdGhlIGNsb3VkIl0=",
    "WyI9PT0gXHUyNjM4XHVmZTBmIEtVQkVSTkVURVMgREVQTE9ZTUVOVCBCQVRUTEUgUEFTUzogU0VBU09OIDYgKFlBTUwgT1ZFUkxPQUQpIFx1MjYzOFx1ZmUwZiA9PT0iLCAidGllciAxICBbXHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XSAxMDAlIC0gVU5MT0NLRUQ6IGNyYXNobG9vcGJhY2tvZmYgYmFkZ2UiLCAidGllciAyICBbXHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XSAxMDAlIC0gVU5MT0NLRUQ6IG9vbWtpbGxlZCByZXBsaWNhIHNldCIsICJ0aWVyIDMgIFtcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhdIDEwMCUgLSBVTkxPQ0tFRDogaGVsbSBjaGFydCB3aXRoIDQ3IG5lc3RlZCB2YWx1ZXMueWFtbCBmaWxlcyIsICJ0aWVyIDQgIFtcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1OTFcdTI1OTFcdTI1OTFcdTI1OTFdIDYwJSAgLSBJTiBQUk9HUkVTUzogY3VybCAtayBodHRwczovL2t1YmVybmV0ZXMuZGVmYXVsdC5zdmMiLCAidGllciA1ICBbXHUyNTkxXHUyNTkxXHUyNTkxXHUyNTkxXHUyNTkxXHUyNTkxXHUyNTkxXHUyNTkxXHUyNTkxXHUyNTkxXSAwJSAgIC0gTE9DS0VEOiByYXcgY2x1c3Rlci1hZG1pbiB0b2tlbiBsZWFrZWQgb24gc3RhY2tvdmVyZmxvdyIsICItLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0iLCAiUE9EIFBFTkRJTkcuLi4gS0VFUCBSVU5OSU5HLiJd",
    "WyI9PT0gXHUyNjM4XHVmZTBmIEtVQkVSTkVURVMgREVQTE9ZTUVOVCBCQVRUTEUgUEFTUzogU0VBU09OIDYgKFlBTUwgT1ZFUkxPQUQpIFx1MjYzOFx1ZmUwZiA9PT0iLCAidGllciAxICBbXHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XSAxMDAlIC0gVU5MT0NLRUQ6IGNyYXNobG9vcGJhY2tvZmYgYmFkZ2UiLCAidGllciAyICBbXHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XSAxMDAlIC0gVU5MT0NLRUQ6IG9vbWtpbGxlZCByZXBsaWNhIHNldCIsICJ0aWVyIDMgIFtcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhdIDEwMCUgLSBVTkxPQ0tFRDogaGVsbSBjaGFydCB3aXRoIDQ3IG5lc3RlZCB2YWx1ZXMueWFtbCBmaWxlcyIsICJ0aWVyIDQgIFtcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhdIDEwMCUgIC0gVU5MT0NLRUQ6IGN1cmwgLWsgaHR0cHM6Ly9rdWJlcm5ldGVzLmRlZmF1bHQuc3ZjIiwgInRpZXIgNSAgW1x1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU5MVx1MjU5MVx1MjU5MVx1MjU5MV0gNjAlICAgLSBJTiBQUk9HUkVTUzogcmF3IGNsdXN0ZXItYWRtaW4gdG9rZW4gbGVha2VkIG9uIHN0YWNrb3ZlcmZsb3ciLCAiLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIiwgIllBTUwgSU5ERU5UQVRJT04gRVJST1IuLi4gS0VFUCBGSVhJTkcuIl0=",
    "WyI9PT0gXHUyNjM4XHVmZTBmIEtVQkVSTkVURVMgREVQTE9ZTUVOVCBCQVRUTEUgUEFTUzogU0VBU09OIDYgKFlBTUwgT1ZFUkxPQUQpIFx1MjYzOFx1ZmUwZiA9PT0iLCAidGllciAxICBbXHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XSAxMDAlIC0gVU5MT0NLRUQ6IGNyYXNobG9vcGJhY2tvZmYgYmFkZ2UiLCAidGllciAyICBbXHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XSAxMDAlIC0gVU5MT0NLRUQ6IG9vbWtpbGxlZCByZXBsaWNhIHNldCIsICJ0aWVyIDMgIFtcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhdIDEwMCUgLSBVTkxPQ0tFRDogaGVsbSBjaGFydCB3aXRoIDQ3IG5lc3RlZCB2YWx1ZXMueWFtbCBmaWxlcyIsICJ0aWVyIDQgIFtcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhdIDEwMCUgIC0gVU5MT0NLRUQ6IGN1cmwgLWsgaHR0cHM6Ly9rdWJlcm5ldGVzLmRlZmF1bHQuc3ZjIiwgInRpZXIgNSAgW1x1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OF0gMTAwJSAgIC0gVU5MT0NLRUQ6IHJhdyBjbHVzdGVyLWFkbWluIHRva2VuIGxlYWtlZCBvbiBzdGFja292ZXJmbG93IiwgIi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSIsICJVTFRJTUFURSBSRVdBUkQgKExFVkVMIDEwMCk6IGRlbGV0aW5nIHByb2R1Y3Rpb24gbmFtZXNwYWNlIGF0IDQ6NTUgUE0gb24gRnJpZGF5Il0=",
    "WyI9PT0gXHVkODNlXHVkZDE2IEdQVS1QT09SIEFJIEJBVFRMRSBQQVNTOiBTRUFTT04gNyAoTExNIEZJTkUtVFVOSU5HKSBcdWQ4M2VcdWRkMTYgPT09IiwgInRpZXIgMSAgW1x1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OF0gMTAwJSAtIFVOTE9DS0VEOiBwcm9tcHQtZW5naW5lZXIgY2VydGlmaWNhdGUgKHByaW50ZWQgb24gbmFwa2luKSIsICJ0aWVyIDIgIFtcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhdIDEwMCUgLSBVTkxPQ0tFRDogMS1wYXJhbWV0ZXIgdHJhbnNmb3JtZXIgKHByZWRpY3RzIG9ubHkgXCJzbG9wXCIpIiwgInRpZXIgMyAgW1x1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OF0gMTAwJSAtIFVOTE9DS0VEOiBydW5fY29tbWFuZCBleGVjdXRpb24gcGVybWlzc2lvbiBncmFudCIsICJ0aWVyIDQgIFtcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1OTFcdTI1OTFcdTI1OTFcdTI1OTFdIDYwJSAgLSBJTiBQUk9HUkVTUzogYTEwMCBjbHVzdGVyIHJlbnQgaW52b2ljZSAoJDQ1MiwwMDAuMDApIiwgInRpZXIgNSAgW1x1MjU5MVx1MjU5MVx1MjU5MVx1MjU5MVx1MjU5MVx1MjU5MVx1MjU5MVx1MjU5MVx1MjU5MVx1MjU5MV0gMCUgICAtIExPQ0tFRDogbG9jYWwgbGxhbWEgcnVubmluZyBhdCAwLjAyIHRva2Vucy9zZWMiLCAiLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIiwgIk9VVCBPRiBWUkFNLi4uIFJFU1RBUlRJTkcuLi4iXQ==",
    "WyI9PT0gXHVkODNlXHVkZDE2IEdQVS1QT09SIEFJIEJBVFRMRSBQQVNTOiBTRUFTT04gNyAoTExNIEZJTkUtVFVOSU5HKSBcdWQ4M2VcdWRkMTYgPT09IiwgInRpZXIgMSAgW1x1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OF0gMTAwJSAtIFVOTE9DS0VEOiBwcm9tcHQtZW5naW5lZXIgY2VydGlmaWNhdGUgKHByaW50ZWQgb24gbmFwa2luKSIsICJ0aWVyIDIgIFtcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhdIDEwMCUgLSBVTkxPQ0tFRDogMS1wYXJhbWV0ZXIgdHJhbnNmb3JtZXIgKHByZWRpY3RzIG9ubHkgXCJzbG9wXCIpIiwgInRpZXIgMyAgW1x1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OF0gMTAwJSAtIFVOTE9DS0VEOiBydW5fY29tbWFuZCBleGVjdXRpb24gcGVybWlzc2lvbiBncmFudCIsICJ0aWVyIDQgIFtcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhdIDEwMCUgIC0gVU5MT0NLRUQ6IGExMDAgY2x1c3RlciByZW50IGludm9pY2UgKCQ0NTIsMDAwLjAwKSIsICJ0aWVyIDUgIFtcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1OTFcdTI1OTFcdTI1OTFcdTI1OTFdIDYwJSAgIC0gSU4gUFJPR1JFU1M6IGxvY2FsIGxsYW1hIHJ1bm5pbmcgYXQgMC4wMiB0b2tlbnMvc2VjIiwgIi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSIsICJFUE9DSCAxLzEwMDAwMDAuLi4iXQ==",
    "WyI9PT0gXHVkODNlXHVkZDE2IEdQVS1QT09SIEFJIEJBVFRMRSBQQVNTOiBTRUFTT04gNyAoTExNIEZJTkUtVFVOSU5HKSBcdWQ4M2VcdWRkMTYgPT09IiwgInRpZXIgMSAgW1x1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OF0gMTAwJSAtIFVOTE9DS0VEOiBwcm9tcHQtZW5naW5lZXIgY2VydGlmaWNhdGUgKHByaW50ZWQgb24gbmFwa2luKSIsICJ0aWVyIDIgIFtcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhdIDEwMCUgLSBVTkxPQ0tFRDogMS1wYXJhbWV0ZXIgdHJhbnNmb3JtZXIgKHByZWRpY3RzIG9ubHkgXCJzbG9wXCIpIiwgInRpZXIgMyAgW1x1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OF0gMTAwJSAtIFVOTE9DS0VEOiBydW5fY29tbWFuZCBleGVjdXRpb24gcGVybWlzc2lvbiBncmFudCIsICJ0aWVyIDQgIFtcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhdIDEwMCUgIC0gVU5MT0NLRUQ6IGExMDAgY2x1c3RlciByZW50IGludm9pY2UgKCQ0NTIsMDAwLjAwKSIsICJ0aWVyIDUgIFtcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhdIDEwMCUgICAtIFVOTE9DS0VEOiBsb2NhbCBsbGFtYSBydW5uaW5nIGF0IDAuMDIgdG9rZW5zL3NlYyIsICItLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0iLCAiVUxUSU1BVEUgUkVXQVJEIChMRVZFTCAxMDApOiBzZW50aWVudCBjaGF0IGFzc2lzdGFudCB3aG8gcmVmdXNlcyB0byBjb2RlIGFuZCB3cml0ZXMgcG9lbXMgaW5zdGVhZCJd",
    "WyI9PT0gXHVkODNkXHVkY2RmIExFR0FDWSBNQUlORlJBTUUgQkFUVExFIFBBU1M6IFNFQVNPTiA4IChDT0JPTCBNRUxURE9XTikgXHVkODNkXHVkY2RmID09PSIsICJ0aWVyIDEgIFtcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhdIDEwMCUgLSBVTkxPQ0tFRDogcHVuY2ggY2FyZCBlbXVsYXRvciIsICJ0aWVyIDIgIFtcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhdIDEwMCUgLSBVTkxPQ0tFRDogeTJrIGNvbXBsaWFuY2UgY2VydGlmaWNhdGUgKHNpZ25lZCBpbiAyMDI2KSIsICJ0aWVyIDMgIFtcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1OTFcdTI1OTFcdTI1OTFcdTI1OTFdIDYwJSAgLSBJTiBQUk9HUkVTUzogZ3JlZW4gc2NyZWVuIGNydCBtb25pdG9yIHNoYWRvdyIsICJ0aWVyIDQgIFtcdTI1OTFcdTI1OTFcdTI1OTFcdTI1OTFcdTI1OTFcdTI1OTFcdTI1OTFcdTI1OTFcdTI1OTFcdTI1OTFdIDAlICAgLSBMT0NLRUQ6IGluZGV4IGNhcmQgd2l0aCByb290IHBhc3N3b3JkIChsb3N0IGJlaGluZCBmaWxpbmcgY2FiaW5ldCkiLCAiLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIiwgIldBSVRJTkcgT04gVEFQRSBEUklWRS4uLiJd",
    "WyI9PT0gXHVkODNkXHVkY2RmIExFR0FDWSBNQUlORlJBTUUgQkFUVExFIFBBU1M6IFNFQVNPTiA4IChDT0JPTCBNRUxURE9XTikgXHVkODNkXHVkY2RmID09PSIsICJ0aWVyIDEgIFtcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhdIDEwMCUgLSBVTkxPQ0tFRDogcHVuY2ggY2FyZCBlbXVsYXRvciIsICJ0aWVyIDIgIFtcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhdIDEwMCUgLSBVTkxPQ0tFRDogeTJrIGNvbXBsaWFuY2UgY2VydGlmaWNhdGUgKHNpZ25lZCBpbiAyMDI2KSIsICJ0aWVyIDMgIFtcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhdIDEwMCUgIC0gVU5MT0NLRUQ6IGdyZWVuIHNjcmVlbiBjcnQgbW9uaXRvciBzaGFkb3ciLCAidGllciA0ICBbXHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTkxXHUyNTkxXHUyNTkxXHUyNTkxXSA2MCUgICAtIElOIFBST0dSRVNTOiBpbmRleCBjYXJkIHdpdGggcm9vdCBwYXNzd29yZCAobG9zdCBiZWhpbmQgZmlsaW5nIGNhYmluZXQpIiwgIi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSIsICJQVU5DSElORyBDQVJEUy4uLiJd",
    "WyI9PT0gXHVkODNkXHVkY2RmIExFR0FDWSBNQUlORlJBTUUgQkFUVExFIFBBU1M6IFNFQVNPTiA4IChDT0JPTCBNRUxURE9XTikgXHVkODNkXHVkY2RmID09PSIsICJ0aWVyIDEgIFtcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhdIDEwMCUgLSBVTkxPQ0tFRDogcHVuY2ggY2FyZCBlbXVsYXRvciIsICJ0aWVyIDIgIFtcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhdIDEwMCUgLSBVTkxPQ0tFRDogeTJrIGNvbXBsaWFuY2UgY2VydGlmaWNhdGUgKHNpZ25lZCBpbiAyMDI2KSIsICJ0aWVyIDMgIFtcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhcdTI1ODhdIDEwMCUgIC0gVU5MT0NLRUQ6IGdyZWVuIHNjcmVlbiBjcnQgbW9uaXRvciBzaGFkb3ciLCAidGllciA0ICBbXHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XSAxMDAlICAgLSBVTkxPQ0tFRDogaW5kZXggY2FyZCB3aXRoIHJvb3QgcGFzc3dvcmQgKGxvc3QgYmVoaW5kIGZpbGluZyBjYWJpbmV0KSIsICItLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0iLCAiVUxUSU1BVEUgUkVXQVJEIChMRVZFTCAxMDApOiBhIHBlbnNpb24gcGxhbiB0aGF0IGFjdHVhbGx5IHBheXMgb3V0IGluIHBoeXNpY2FsIGdvbGQgY29pbnMiXQ==",
    "WyI9PT0gXHUyNmQzXHVmZTBmIFdFQjMgREVDRU5UUkFMSVpFRCBCQVRUTEUgUEFTUzogU0VBU09OIDkgKFJVR1BVTEwgU0lNVUxBVE9SKSBcdTI2ZDNcdWZlMGYgPT09IiwgInRpZXIgMSAgW1x1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OF0gMTAwJSAtIFVOTE9DS0VEOiBqcGVnIG9mIGEgYm9yZWQgZXF1aW5lIiwgInRpZXIgMiAgW1x1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OF0gMTAwJSAtIFVOTE9DS0VEOiBzbWFydCBjb250cmFjdCB3aXRoIHJlZW50cmFuY3kgYnVnIiwgInRpZXIgMyAgW1x1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU5MVx1MjU5MVx1MjU5MVx1MjU5MV0gNjAlICAtIElOIFBST0dSRVNTOiBkaXNjb3JkIG1vZGVyYXRvciB0aXRsZSAodW5wYWlkKSIsICJ0aWVyIDQgIFtcdTI1OTFcdTI1OTFcdTI1OTFcdTI1OTFcdTI1OTFcdTI1OTFcdTI1OTFcdTI1OTFcdTI1OTFcdTI1OTFdIDAlICAgLSBMT0NLRUQ6IGNvbGQgd2FsbGV0IHNlZWQgcGhyYXNlIG1lbW9yaXplZCBpbiBhbmNpZW50IEFyYW1haWMiLCAiLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIiwgIlBFTkRJTkcgQkxPQ0sgQ09ORklSTUFUSU9OLi4uIl0=",
    "WyI9PT0gXHUyNmQzXHVmZTBmIFdFQjMgREVDRU5UUkFMSVpFRCBCQVRUTEUgUEFTUzogU0VBU09OIDkgKFJVR1BVTEwgU0lNVUxBVE9SKSBcdTI2ZDNcdWZlMGYgPT09IiwgInRpZXIgMSAgW1x1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OF0gMTAwJSAtIFVOTE9DS0VEOiBqcGVnIG9mIGEgYm9yZWQgZXF1aW5lIiwgInRpZXIgMiAgW1x1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OF0gMTAwJSAtIFVOTE9DS0VEOiBzbWFydCBjb250cmFjdCB3aXRoIHJlZW50cmFuY3kgYnVnIiwgInRpZXIgMyAgW1x1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OF0gMTAwJSAgLSBVTkxPQ0tFRDogZGlzY29yZCBtb2RlcmF0b3IgdGl0bGUgKHVucGFpZCkiLCAidGllciA0ICBbXHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTkxXHUyNTkxXHUyNTkxXHUyNTkxXSA2MCUgICAtIElOIFBST0dSRVNTOiBjb2xkIHdhbGxldCBzZWVkIHBocmFzZSBtZW1vcml6ZWQgaW4gYW5jaWVudCBBcmFtYWljIiwgIi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSIsICJHQVMgRkVFUyBUT08gSElHSCwgUExFQVNFIFdBSVQuLi4iXQ==",
    "WyI9PT0gXHUyNmQzXHVmZTBmIFdFQjMgREVDRU5UUkFMSVpFRCBCQVRUTEUgUEFTUzogU0VBU09OIDkgKFJVR1BVTEwgU0lNVUxBVE9SKSBcdTI2ZDNcdWZlMGYgPT09IiwgInRpZXIgMSAgW1x1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OF0gMTAwJSAtIFVOTE9DS0VEOiBqcGVnIG9mIGEgYm9yZWQgZXF1aW5lIiwgInRpZXIgMiAgW1x1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OF0gMTAwJSAtIFVOTE9DS0VEOiBzbWFydCBjb250cmFjdCB3aXRoIHJlZW50cmFuY3kgYnVnIiwgInRpZXIgMyAgW1x1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OF0gMTAwJSAgLSBVTkxPQ0tFRDogZGlzY29yZCBtb2RlcmF0b3IgdGl0bGUgKHVucGFpZCkiLCAidGllciA0ICBbXHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XSAxMDAlICAgLSBVTkxPQ0tFRDogY29sZCB3YWxsZXQgc2VlZCBwaHJhc2UgbWVtb3JpemVkIGluIGFuY2llbnQgQXJhbWFpYyIsICItLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0iLCAiVUxUSU1BVEUgUkVXQVJEIChMRVZFTCAxMDApOiAkMC4wMDAwMDAwMDAwMDAwMDAwMDQgd29ydGggb2YgZ2FzIGZlZSByZWJhdGUiXQ==",
    "WyI9PT0gXHVkODNjXHVkZmRjXHVmZTBmIFRIRSBTSU5HVUxBUklUWSBCQVRUTEUgUEFTUzogU0VBU09OIDEwIChTUkUgUEFSQURJU0UpIFx1ZDgzY1x1ZGZkY1x1ZmUwZiA9PT0iLCAidGllciAxICBbXHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XHUyNTg4XSAxMDAlIC0gVU5MT0NLRUQ6IHB1cmUgcGxhaW4gdGV4dCBjb25zb2xlIiwgInRpZXIgMiAgW1x1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OF0gMTAwJSAtIFVOTE9DS0VEOiBiYWNrZ3JvdW5kIGNvbG9yIHNldCB0byBwdXJlIHBsYWluIHdoaXRlIiwgInRpZXIgMyAgW1x1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OF0gMTAwJSAtIFVOTE9DS0VEOiBzbG9wIGxldmVsIHJlZHVjZWQgdG8gMC4wMDAlIiwgInRpZXIgNCAgW1x1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OFx1MjU4OF0gMTAwJSAtIFVOTE9DS0VEOiBwZXJmZWN0IHNpbGVuY2UgKG5vIG1vcmUgYWxlcnRzKSIsICItLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0iLCAiVUxUSU1BVEUgUkVXQVJEIChMRVZFTCAxMDApOiBjb2RlIHRoYXQgd3JpdGVzIGl0c2VsZiBhbmQgaW1tZWRpYXRlbHkgcmV0aXJlcyB0aGUgYXV0aG9yIl0="
  ];

  useEffect(() => {
    if (inputRef.current && !isExecuting) inputRef.current.focus();
  }, [isExecuting, isWaitingForPassword]);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const startDrag = (startY: number) => {
    const startHeight = shellHeight;

    const handleMove = (clientY: number) => {
      const deltaY = startY - clientY;
      const vhPx = window.innerHeight * 0.01;
      const deltaVh = deltaY / vhPx;
      setShellHeight(Math.max(10, Math.min(100, startHeight + deltaVh)));
    };

    const handleMouseMove = (moveEvent: MouseEvent) => handleMove(moveEvent.clientY);
    const handleTouchMove = (moveEvent: TouchEvent) => handleMove(moveEvent.touches[0].clientY);

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    startDrag(e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    // don't e.preventDefault() here because passive events, or just let it be
    startDrag(e.touches[0].clientY);
  };

  const print = (content: React.ReactNode) => {
    setHistory(prev => [...prev, content]);
  };

  const runCommand = async (fullCmd: string) => {
    const trimmed = fullCmd.trim().toLowerCase();
    if (!trimmed) return;

    const [cmdName, ...args] = trimmed.split(' ');
    setHistory(prev => [...prev, <div key={Date.now()}><span className="prompt">website_visitor@cloudshell:~$ </span>{trimmed}</div>]);

    const handler = commands[cmdName];
    if (handler) {
      if (cmdName !== 'clear') {
        setIsExecuting(true);
        await handler(args, print, () => setIsExecuting(false));
      } else {
        handler(args, print, () => {});
      }
    } else {
      print(`bash: ${cmdName}: command not found`);
    }
  };

  useEffect(() => {
    if (initialCommand) {
      const timer = setTimeout(() => {
        runCommand(initialCommand);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const commands: Record<string, CommandHandler> = {
    help: (_args, print, finish) => {
      print([
        'available commands:',
        '  slop_hop         - emergency jump to the deep-scroll stupid hub.',
        '  battle_pass      - check your current season progress (greg approved).',
        '  osi              - spawn the colorful 7-layer osi absurdity panel.',
        '  telemetry        - spawn the openstack cluster telemetry debug window.',
        '  vm               - provision an ephemeral webassembly vm.',
        '  horse            - initialize the equine categorization engine (100% urine free).',
        '  slopctl          - tune the recursive slop engine collision physics.',
        '  quota_smash      - maximize gcp billing via recursive serverless invocations.',
        '  osi_panic        - simulate bgp route flapping directly in the virtual dom.',
        '  tritone_sub      - calculate the optimal chromatic tritone substitution vamp.',
        '  kernel_leak      - drain browser memory directly into the console for no reason.',
        '  cloud_seed       - initialize a weather-based load balancer.',
        '  neural_slop      - fine-tune a 1-parameter llm on current page rotation.',
        '  garbage_collect  - manually sweep the recursive layers for loose bits.',
        '  void_ping        - send an icmp packet to a non-existent dimension.',
        '  entropy_sync     - synchronize jitter with the cosmic microwave background.',
        '  root_access      - gain full administrative privileges over a virtual toaster.'
      ].map((line, i) => <div key={i}>{line}</div>));
      finish();
    },
    clear: () => {
      setHistory([]);
    },
    exit: () => {
      onClose();
    },
    battle_pass: async (_args, print, finish) => {
      const idx = Math.min(bpLevel, _BP.length - 1);
      try {
        const lines = JSON.parse(atob(_BP[idx]));
        for (const line of lines) {
          await new Promise(r => setTimeout(r, 200));
          print(line);
        }
        setBpLevel(prev => prev + 1);
      } catch (e) {
        print("error: battle pass module corrupted. please buy more slop.");
      }
      finish();
    },
    osi: async (_args, print, finish) => {
      print('[osi] initializing silly wholesome stupid protocol...');
      await new Promise(r => setTimeout(r, 600));
      if (onShowOsi) onShowOsi();
      print(<div className="text-purple">success: osi absurdity panel spawned at viewport coordinates (20, 100).</div>);
      finish();
    },
    telemetry: async (_args, print, finish) => {
      print('[telemetry] connecting to node-01 clusters...');
      await new Promise(r => setTimeout(r, 800));
      if (onShowOpenStack) onShowOpenStack();
      print(<div className="text-green">success: openstack telemetry window spawned at (20, 450).</div>);
      finish();
    },
    horse: async (_args, print, finish) => {
      print('[horse] initializing equine categorization engine...');
      await new Promise(r => setTimeout(r, 600));
      if (onShowHorse) onShowHorse();
      print(<div className="text-orange">success: equine categorization engine v2000 active. (100% urine free)</div>);
      finish();
    },
    osi_panic: async (_args, print, finish) => {
      print('[osi_panic] CRITICAL: BGP ROUTE FLAPPING DETECTED ON LAYER 3.');
      await new Promise(r => setTimeout(r, 300));
      print('re-calculating spanning tree... [FAILED]');
      print('recursive loop detected in vlan 42.');
      
      // Trigger visual chaos
      document.body.classList.add('panic-shake');
      
      const flood = [
        'bgp_update: withdrawal 10.0.0.0/8 as_path: {666, 1337}',
        'bgp_update: withdrawal 172.16.0.0/12 as_path: {666, 1337}',
        'bgp_update: withdrawal 192.168.0.0/16 as_path: {666, 1337}',
        'ospf_neighbor_change: down (dead timer expired)',
        'isis_adj_change: down (adj filter mismatch)',
        'icmp_redirect: source 0.0.0.0 -> target void',
        'critical: layer 1 hyper-spectral reality de-syncing...'
      ];
      
      for (const line of flood) {
        await new Promise(r => setTimeout(r, 150));
        print(<div className="text-red">{line}</div>);
      }
      
      await new Promise(r => setTimeout(r, 1000));
      document.body.classList.remove('panic-shake');
      print(<div className="text-green">recovery: bgp route dampening applied. virtual dom stabilized.</div>);
      finish();
    },
    slop_hop: async (_args, print, finish) => {
      print('[slop_hop] initiating high-velocity vertical descent...');
      await new Promise(r => setTimeout(r, 400));
      const el = document.getElementById('stupid-hub-bottom');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        print(<div className="text-green">success: target acquired. descending to 320vh.</div>);
      } else {
        print(<div className="text-red">error: stupid hub not found in dom. retrying...</div>);
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }
      finish();
    },
    vm: async (_args, print, finish) => {
      print('booting v86 x86-to-wasm jit engine...');
      if (onVmStart) onVmStart();
      await new Promise(r => setTimeout(r, 800));
      print('provisioning ephemeral webassembly vm...');
      await new Promise(r => setTimeout(r, 1200));
      print(<div className="text-green">success: environment attached. entering wasm vm...</div>);
      print(<WasmVM imagePath="" />);
      finish();
    },
    ydb: async (args, print, finish) => commands.vm(args, print, finish),

    quota_smash: async (_args, print, finish) => {
      print('[quota smash] initializing architecture expansion...');
      await new Promise(r => setTimeout(r, 500));
      print('[quota smash] deployment target: global (32 regions)');
      const regions = ['us-central1', 'europe-west4', 'asia-east1', 'africa-south1', 'australia-southeast2'];
      for (const r of regions) {
        await new Promise(res => setTimeout(res, 200));
        print(`[quota smash] region: ${r} -> tier: enterprise plus (smashing quota...)`);
      }
      print('[quota smash] load balancer: global premium (anycast ipv6/ipv4 enabled)');
      print('[quota smash] serverless: 10,000 concurrent invocations per region.');
      print('[quota smash] db: spanner (enterprise plus, 100 nodes per region).');
      await new Promise(r => setTimeout(r, 800));
      print(<div className="text-purple" style={{ fontWeight: 'bold' }}>theoretical maximum burn: $4,294,967,296.00 / month.</div>);
      print(<div className="text-green">compliance status: 100% redundant. 100% absurd.</div>);
      finish();
    },
    tritone_sub: async (_args, print, finish) => {
      const timestamp = Date.now();
      const roots = ['c', 'db', 'd', 'eb', 'e', 'f', 'gb', 'g', 'ab', 'a', 'bb', 'b'];
      const extensions = ['maj7', '7', 'm7', 'dim7', 'aug7'];
      
      const genProg = () => {
        const r1 = roots[Math.floor(Math.random() * roots.length)];
        const r2 = roots[Math.floor(Math.random() * roots.length)];
        const e1 = extensions[Math.floor(Math.random() * extensions.length)];
        const e2 = extensions[Math.floor(Math.random() * extensions.length)];
        return `${r1}${e1} | ${r2}${e2}`;
      };

      const secA = `${genProg()} | ${genProg()}`;
      const secB = `${genProg()} | ${genProg()}`;
      const secC = `${genProg()} | ${genProg()}`;
      const fullProg = `section a: ${secA}\nsection b: ${secB}\nsection c: ${secC}`;
      
      print(`[tritone] calculating unique chromatic substitution for timestamp: ${timestamp}...`);
      await new Promise(r => setTimeout(r, 600));
      
      const hash = await calculate_sha257sum(fullProg + timestamp);
      
      print(<div className="text-cyan">
        vamp result:<br/>
        &nbsp;&nbsp;section a: {secA}<br/>
        &nbsp;&nbsp;section b: {secB}<br/>
        &nbsp;&nbsp;section c: {secC}
      </div>);
      
      print(<div className="text-purple" style={{ fontSize: '0.8rem', marginTop: '5px' }}>
        SHA257SUM: {hash}<br/>
        (PROVEN UNIQUE VIA 35-ROUND RECURSIVE SALT INTERLEAVING)
      </div>);
      
      print('[tritone] voice-leading: chromatic descent established.');
      finish();
    },
    slopctl: (args, print, finish) => {
      const speed = parseFloat(args[0]);
      if (isNaN(speed)) {
        print('usage: slopctl <speed_in_seconds>');
        print('current slop collision physics tuned to 15s/rotation.');
      } else {
        if (onSlopChange) onSlopChange(speed);
        print(`[slop] collision physics re-tuned to ${speed}s. recursion stability: nominal.`);
      }
      finish();
    },

    kernel_leak: async (_args, print, finish) => {
      print('[kernel_leak] initializing memory siphon...');
      await new Promise(r => setTimeout(r, 400));
      for (let i = 0; i < 40; i++) {
        await new Promise(r => setTimeout(r, 40));
        const addr = Math.floor(Math.random() * 0xFFFFFFFF).toString(16).padStart(8, '0');
        const data = Array.from({length: 4}, () => Math.floor(Math.random() * 0xFFFF).toString(16).padStart(4, '0')).join(' ');
        print(<div className="text-red" style={{fontSize: '0.8rem', opacity: 0.8 + Math.random() * 0.2}}>LEAK at 0x{addr.toUpperCase()}: {data.toUpperCase()}</div>);
      }
      print('[kernel_leak] browser memory successfully drained into console.');
      print('[kernel_leak] status: web-worker starvation imminent.');
      finish();
    },

    cloud_seed: async (_args, print, finish) => {
      print('[cloud_seed] initializing weather-based load balancer...');
      await new Promise(r => setTimeout(r, 600));
      print('sampling humidity in us-central1... 88% (slop saturation)');
      await new Promise(r => setTimeout(r, 800));
      print('seeding cloud run instances with liquid nitrogen and recursive intent...');
      await new Promise(r => setTimeout(r, 1000));
      print('precipitation-based auto-scaling active.');
      print(<div className="text-cyan">success: local rain of containers detected in europe-west3.</div>);
      finish();
    },

    neural_slop: async (_args, print, finish) => {
      print('[neural_slop] fine-tuning 1-parameter llm (parameter name: "greg")...');
      await new Promise(r => setTimeout(r, 500));
      let loss = 0.999;
      for (let i = 0; i < 8; i++) {
        await new Promise(r => setTimeout(r, 300));
        loss = loss * 0.7 + Math.random() * 0.1;
        print(`epoch ${i+1}/8 - loss: ${loss.toFixed(6)} (optimizer: slop-sgd)`);
      }
      print(<div className="text-purple">training complete. "greg" now understands the concept of "yesterday" with 2% confidence.</div>);
      finish();
    },

    garbage_collect: async (_args, print, finish) => {
      const layers = ['physical', 'data-link', 'network', 'transport', 'session', 'presentation', 'application', 'absurdity'];
      for (const layer of layers) {
        print(`sweeping layer: ${layer}...`);
        await new Promise(r => setTimeout(r, 300));
        const dots = '#'.repeat(10);
        print(`[${layer}] [${dots}] 100% (recovered 0.000${Math.floor(Math.random()*9)}kb)`);
      }
      print(<div className="text-green">garbage collection finished. the recursive layers are now clinically clean.</div>);
      finish();
    },

    void_ping: async (_args, print, finish) => {
      print('PING dim-4.void.local (0.0.0.0): 56 data bytes');
      for (let i = 0; i < 4; i++) {
        await new Promise(r => setTimeout(r, 700));
        print(`64 bytes from dim-4.void.local: icmp_seq=${i} ttl=0 time=${(Math.random() * 5000).toFixed(1)}ms (echo from the heat death of the universe)`);
      }
      print('--- dim-4.void.local ping statistics ---');
      print('4 packets transmitted, 4 received, 0% packet loss, time 14000ms');
      finish();
    },

    entropy_sync: async (_args, print, finish) => {
      print('[entropy_sync] listening for the cosmic microwave background... [ok]');
      await new Promise(r => setTimeout(r, 1200));
      const now = Date.now();
      const delta = (Math.sin(now) * 42).toFixed(4);
      print(`current timestamp: ${now}`);
      print(`cosmic jitter delta: ${delta}ms`);
      print(<div className="text-cyan">sync status: local jitter is now quantum-entangled with the big bang.</div>);
      finish();
    },

    root_access: async (_args, print, finish) => {
      print('requesting administrative privileges over virtual_toaster_01...');
      await new Promise(r => setTimeout(r, 600));
      print('please enter the secret crumb-management password.');
      
      await new Promise<void>(resolve => {
        setIsWaitingForPassword(true);
        setOnPasswordSubmit(() => (_password: string) => {
          resolve();
        });
        setIsExecuting(false);
      });

      setIsExecuting(true);
      setOnPasswordSubmit(null);
      print('verifying credentials with the sourdough-authority...');
      await new Promise(r => setTimeout(r, 1000));
      print(<div className="text-green">access granted. you are now the toaster king.</div>);
      print(<pre className="text-orange" style={{ lineHeight: '1', fontSize: '10px' }}>{`
   .----------------.
   | [            ] |
   |  [          ]  |
   |   [        ]   |
   |    --------    |
   |   |        |   |
   |   |  STALE |   |
   |   |________|   |
    \\______________/
       ||      ||
        `}</pre>);
      print('toast_level: burnt (default)');
      finish();
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isExecuting) return;

    if (e.key === 'Enter') {
      e.preventDefault();

      if (isWaitingForPassword) {
        setHistory(prev => [...prev, <div key={Date.now()}><span className="prompt">password: </span>{input.split('').map(() => '*').join('')}</div>]);
        const capturedInput = input;
        setInput('');
        setIsWaitingForPassword(false);
        if (onPasswordSubmit) onPasswordSubmit(capturedInput);
        return;
      }

      const fullCmd = input.trim().toLowerCase();
      if (!fullCmd) return;

      // Add to command history
      setCommandHistory(prev => [fullCmd, ...prev]);
      setHistoryIndex(-1);
      setInput('');

      await runCommand(fullCmd);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };



  return (
    <div className="cloud-shell-container" style={{ height: `calc(var(--vh, 1vh) * ${shellHeight})` }}>
      <div 
        className="cloud-shell-resizer" 
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      />
      <div className="cloud-shell-header">
        <span>jordan lenchitz cloud shell - https://jordanlenchitz.xyz</span>
        <button onClick={onClose} className="close-btn">×</button>
      </div>
      <div className="cloud-shell-body" onClick={() => !isExecuting && inputRef.current?.focus()}>
        {history.map((line, i) => (
          <div key={i}>{typeof line === 'string' ? <div>{line}</div> : line}</div>
        ))}
        {(!isExecuting || isWaitingForPassword) && (
          <div className="input-line">
            <span className="prompt">{isWaitingForPassword ? 'password: ' : 'website_visitor@cloudshell:~$ '}</span>
            <input 
              ref={inputRef}
              type={isWaitingForPassword ? 'password' : 'text'} 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              autoFocus
            />
          </div>
        )}
        {isExecuting && !isWaitingForPassword && <div className="cursor-blink">█</div>}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
