import {
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  IconButton,
  Tooltip,
} from '@layer5/sistent';
import useStyles from './MesheryPatterns/Cards.styles';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import FullscreenExit from '@mui/icons-material/FullscreenExit';
import DeleteIcon from '@mui/icons-material/Delete';
import Fullscreen from '@mui/icons-material/Fullscreen';
import Save from '@mui/icons-material/Save';
import { StyledDialog, YamlDialogTitleText } from './MesheryPatterns/style';

const YAMLDialog = ({
  fullScreen,
  name,
  toggleFullScreen,
  config_file,
  setYaml,
  deleteHandler,
  updateHandler,
  isReadOnly = false,
}) => {
  const classes = useStyles();
  return (
    <Dialog
      aria-labelledby="filter-dialog-title"
      open
      maxWidth="md"
      fullScreen={fullScreen}
      fullWidth={!fullScreen}
    >
      <StyledDialog disableTypography id="filter-dialog-title">
        <YamlDialogTitleText variant="h6">{name}</YamlDialogTitleText>
        <Tooltip title="Exit Fullscreen" arrow interactive placement="bottom">
          <IconButton onClick={toggleFullScreen}>
            {fullScreen ? <FullscreenExit /> : <Fullscreen />}
          </IconButton>
        </Tooltip>
      </StyledDialog>
      <Divider variant="fullWidth" light />
      <DialogContent>
        <CodeMirror
          value={config_file}
          className={fullScreen ? classes.fullScreenCodeMirror : ''}
          options={{
            theme: 'material',
            lineNumbers: true,
            lineWrapping: true,
            gutters: ['CodeMirror-lint-markers'],
            lint: true,
            mode: 'text/x-yaml',
            readOnly: isReadOnly,
          }}
          onChange={(_, data, val) => setYaml(val)}
        />
      </DialogContent>
      <Divider variant="fullWidth" light />
      {isReadOnly ? null : (
        <DialogActions>
          <Tooltip title="Update Pattern">
            <IconButton aria-label="Update" color="primary" onClick={updateHandler}>
              <Save />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Filter">
            <IconButton aria-label="Delete" color="primary" onClick={deleteHandler}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default YAMLDialog;
